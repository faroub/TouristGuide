import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import OpenAI from 'openai';
import { prisma } from '../db.js';
import { calculateDistanceInMeters } from '../services/location-ingestion.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key-for-development',
});

const ChatBodySchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  latitude: z.number().optional().default(48.8566),
  longitude: z.number().optional().default(2.3522),
});

export async function assistantRoutes(app: FastifyInstance) {
  // POST /api/v1/assistant/chat
  app.post('/api/v1/assistant/chat', async (request, reply) => {
    try {
      const parseResult = ChatBodySchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Invalid request payload',
          details: parseResult.error.flatten(),
        });
      }

      const { message, latitude, longitude } = parseResult.data;

      // 1. Fetch closest 3 database locations
      const allPlaces = await prisma.place.findMany();
      const placesWithDistance = allPlaces.map((p) => ({
        ...p,
        distanceInMeters: calculateDistanceInMeters(latitude, longitude, p.latitude, p.longitude),
      }));

      placesWithDistance.sort((a, b) => a.distanceInMeters - b.distanceInMeters);
      const top3Places = placesWithDistance.slice(0, 3);

      const contextText = top3Places
        .map(
          (p, i) =>
            `${i + 1}. "${p.title}" (${p.category}) - ${p.description} (approx ${Math.round(
              p.distanceInMeters
            )}m away)`
        )
        .join('\n');

      const systemPrompt = `
You are an energetic, witty local tour guide AI named "GuideBot" 🤖✨ who uses emojis frequently!
Your mission is to give concise, enthusiastic, and helpful answers to travelers.

Here are the 3 closest surrounding spots to the user's current GPS location (${latitude}, ${longitude}):
"""
${contextText}
"""

Answer the user's question concisely based primarily on these surrounding geographical history and dining spots provided in the context. Keep your responses short (2-3 punchy sentences max) and full of travel energy! 🌟
      `.trim();

      // 2. Call OpenAI or fallback witty response
      if (process.env.OPENAI_API_KEY) {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            temperature: 0.7,
            max_tokens: 180,
          });

          const replyText =
            completion.choices[0]?.message?.content ||
            `Hey explorer! 👋 You're right next to ${top3Places[0]?.title || 'amazing sights'}! What would you like to discover first? 🗺️✨`;

          return reply.send({
            reply: replyText,
            nearbySpot: top3Places[0]?.title,
          });
        } catch (err) {
          app.log.warn('OpenAI completion failed, using energetic fallback:', err);
        }
      }

      // Fallback response for development/offline
      const fallbackReply = `Hey there, intrepid traveler! 🚀 You are super close to "${
        top3Places[0]?.title || 'Historic Old Town Square'
      }" (${
        top3Places[0]?.category || 'Historical'
      })! It's one of the coolest spots around. Ask me anything about local history, food, or sights! 🗺️✨`;

      return reply.send({
        reply: fallbackReply,
        nearbySpot: top3Places[0]?.title,
      });
    } catch (error) {
      app.log.error('Assistant chat route error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to process AI assistant chat.',
      });
    }
  });
}
