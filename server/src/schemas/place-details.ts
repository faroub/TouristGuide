import { z } from 'zod';

// 1. Timeline Event Sub-schema
export const TimelineEventSchema = z.object({
  year: z.string().describe('Year or century of the event'),
  event: z.string().describe('Historical event description'),
});

// 2. Historical Details Zod Schema
export const HistoricalDetailsSchema = z.object({
  era: z.string().describe('Historical era e.g. Medieval, Renaissance, 19th Century'),
  keyFigures: z.array(z.string()).describe('Important historical people associated'),
  architecturalStyle: z.string().optional().describe('Architectural style e.g. Gothic, Baroque'),
  timelineEvents: z
    .array(TimelineEventSchema)
    .describe('Key historical milestones'),
});

export type HistoricalDetails = z.infer<typeof HistoricalDetailsSchema>;

// 3. Opening Hours Structured Object Sub-schema
export const OpeningHoursSchema = z.object({
  monday: z.string().optional(),
  tuesday: z.string().optional(),
  wednesday: z.string().optional(),
  thursday: z.string().optional(),
  friday: z.string().optional(),
  saturday: z.string().optional(),
  sunday: z.string().optional(),
});

// 4. Restaurant Details Zod Schema
export const RestaurantDetailsSchema = z.object({
  cuisineType: z.array(z.string()).describe('Types of cuisine e.g. French, Italian, Asian'),
  priceTier: z.enum(['$', '$$', '$$$', '$$$$']).describe('Price tier indicator'),
  mustTryDishes: z.array(z.string()).describe('Recommended signature dishes'),
  dietaryOptions: z
    .array(z.string())
    .describe('Dietary tags e.g. Vegan, Gluten-Free, Halal, Vegetarian'),
  openingHours: OpeningHoursSchema.optional().describe('Structured opening hours'),
});

export type RestaurantDetails = z.infer<typeof RestaurantDetailsSchema>;

// 5. Event Details Zod Schema
export const EventDetailsSchema = z.object({
  startDate: z.string().describe('Event start date/time ISO string or readable text'),
  endDate: z.string().optional().describe('Event end date/time ISO string or readable text'),
  ticketRequired: z.boolean().default(false).describe('Whether tickets/entry fee are required'),
  organizer: z.string().optional().describe('Event organizer or host body'),
});

export type EventDetails = z.infer<typeof EventDetailsSchema>;

// 6. Category-Aware Validator Helper
export function validateCategoryDetails(category: string, rawDetails: unknown) {
  switch (category) {
    case 'HISTORICAL':
    case 'CULTURAL':
      return { historicalDetails: HistoricalDetailsSchema.parse(rawDetails) };
    case 'RESTAURANT':
      return { restaurantDetails: RestaurantDetailsSchema.parse(rawDetails) };
    case 'EVENT':
      return { eventDetails: EventDetailsSchema.parse(rawDetails) };
    default:
      return {};
  }
}
