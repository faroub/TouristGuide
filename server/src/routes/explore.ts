import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Category } from '@prisma/client';
import { prisma } from '../db.js';
import {
  getOrFetchLocation,
  calculateDistanceInMeters,
} from '../services/location-ingestion.js';

// --- Zod Validation Schemas ---
export const ExploreQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  query: z.string().trim().optional(),
  category: z
    .enum(['All', 'HISTORICAL', 'CULTURAL', 'SIGHTSEEING', 'RESTAURANT', 'EVENT'])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const CreatePlaceBodySchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.enum(['HISTORICAL', 'CULTURAL', 'SIGHTSEEING', 'RESTAURANT', 'EVENT']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  coverImage: z.string().url('Cover image must be a valid URL').optional(),
});

export async function exploreRoutes(app: FastifyInstance) {
  // 1. GET /api/v1/explore - Scraper + UGC combined, proximity-sorted
  app.get('/api/v1/explore', async (request, reply) => {
    try {
      // Validate query params with Zod
      const parseResult = ExploreQuerySchema.safeParse(request.query);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Invalid query parameters',
          details: parseResult.error.flatten(),
        });
      }

      const { lat, lng, query, category, page, limit } = parseResult.data;

      // Execute scraper/cache ingestion pipeline if coords or query provided
      if (query || (lat !== undefined && lng !== undefined)) {
        await getOrFetchLocation({
          query,
          latitude: lat,
          longitude: lng,
        }).catch((err) => app.log.warn('Ingestion execution warning:', err));
      }

      // Build database query filters
      const whereClause: any = {};
      if (query) {
        whereClause.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ];
      }

      if (category && category !== 'All') {
        whereClause.category = category as Category;
      }

      // Fetch all candidate places (scraped + UGC)
      const allPlaces = await prisma.place.findMany({
        where: whereClause,
      });

      // Calculate distance & sort by proximity if lat/lng are provided
      let formattedItems = allPlaces.map((place) => {
        let distanceInMeters = 0;
        let distanceFormatted = 'Nearby';

        if (lat !== undefined && lng !== undefined) {
          distanceInMeters = calculateDistanceInMeters(
            lat,
            lng,
            place.latitude,
            place.longitude
          );
          const km = (distanceInMeters / 1000).toFixed(1);
          distanceFormatted = `${km} km away`;
        }

        return {
          id: place.id,
          title: place.title,
          description: place.description,
          excerpt: place.description,
          category: place.category,
          latitude: place.latitude,
          longitude: place.longitude,
          coordinates: {
            latitude: place.latitude,
            longitude: place.longitude,
          },
          address: place.address,
          imageUrl:
            place.coverImage ||
            'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
          rating: place.rating,
          sourceUrl: place.sourceUrl || 'https://mytravelapp.com',
          isUserGenerated: place.isUserGenerated,
          distanceInMeters,
          distanceInKm: parseFloat((distanceInMeters / 1000).toFixed(1)),
          distanceFormatted,
          createdAt: place.createdAt,
        };
      });

      // Sort by proximity if coordinates are present
      if (lat !== undefined && lng !== undefined) {
        formattedItems.sort((a, b) => a.distanceInMeters - b.distanceInMeters);
      } else {
        formattedItems.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      // Apply pagination
      const skip = (page - 1) * limit;
      const paginatedItems = formattedItems.slice(skip, skip + limit);
      const totalPages = Math.ceil(formattedItems.length / limit) || 1;

      return reply.status(200).send({
        items: paginatedItems,
        page,
        totalPages,
        totalItems: formattedItems.length,
        hasMore: page < totalPages,
      });
    } catch (error) {
      app.log.error('GET /api/v1/explore route failure:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching explore locations.',
      });
    }
  });

  // 2. POST /api/v1/places - User Generated Content (UGC) spot creation
  app.post('/api/v1/places', async (request, reply) => {
    try {
      // Validate request body with Zod
      const parseResult = CreatePlaceBodySchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Invalid request body payload',
          details: parseResult.error.flatten(),
        });
      }

      const payload = parseResult.data;

      // Create new UGC place record in PostgreSQL
      const createdPlace = await prisma.place.create({
        data: {
          title: payload.title,
          description: payload.description,
          category: payload.category,
          latitude: payload.latitude,
          longitude: payload.longitude,
          address: payload.address,
          coverImage:
            payload.coverImage ||
            'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
          isUserGenerated: true,
          rating: 5.0,
          sourceUrl: 'https://mytravelapp.com',
        },
      });

      app.log.info(`✨ Created UGC place: ${createdPlace.title} (ID: ${createdPlace.id})`);

      return reply.status(201).send({
        id: createdPlace.id,
        title: createdPlace.title,
        description: createdPlace.description,
        excerpt: createdPlace.description,
        category: createdPlace.category,
        latitude: createdPlace.latitude,
        longitude: createdPlace.longitude,
        coordinates: {
          latitude: createdPlace.latitude,
          longitude: createdPlace.longitude,
        },
        address: createdPlace.address,
        imageUrl: createdPlace.coverImage,
        rating: createdPlace.rating,
        isUserGenerated: createdPlace.isUserGenerated,
        distanceInKm: 0.1,
        distanceFormatted: '0.1 km away',
        createdAt: createdPlace.createdAt,
      });
    } catch (error) {
      app.log.error('POST /api/v1/places route failure:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while saving the spot.',
      });
    }
  });
}
