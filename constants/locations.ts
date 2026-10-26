export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SourceMetadata {
  provider: string;
  author: string;
  license: string;
  sourceUrl: string;
}

export type CategoryType = 'All' | 'Historical' | 'Cultural' | 'Dining' | 'Events';

export interface Location {
  id: string;
  title: string;
  category: Exclude<CategoryType, 'All'>;
  rating: number;
  reviewsCount: number;
  distanceInKm: number;
  distanceFormatted: string;
  excerpt: string;
  description: string;
  imageUrl: string;
  coordinates: Coordinates;
  sourceMetadata: SourceMetadata;
  isSaved?: boolean;
}

export const CATEGORIES: CategoryType[] = ['All', 'Historical', 'Cultural', 'Dining', 'Events'];

export const DEFAULT_CITY_COORDINATES: Coordinates = {
  latitude: 48.8566, // Paris, France
  longitude: 2.3522,
};

export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'loc-001',
    title: 'Historic Old Town Square',
    category: 'Historical',
    rating: 4.8,
    reviewsCount: 1240,
    distanceInKm: 0.8,
    distanceFormatted: '0.8 km away',
    excerpt: 'Centuries-old cobblestone market square flanked by Gothic towers and vibrant local artisan markets.',
    description: 'The Old Town Square is the historic heart of the city, featuring medieval architecture, the famous Astronomical Clock, and lively street performances throughout the day.',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
    coordinates: {
      latitude: 48.8584,
      longitude: 2.3508,
    },
    sourceMetadata: {
      provider: 'OpenStreetMap & Local Heritage Registry',
      author: 'City Tourism Bureau',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://api.touristguide.example/v1/locations/loc-001',
    },
    isSaved: true,
  },
  {
    id: 'loc-002',
    title: 'Le Petit Bistro & Terrace',
    category: 'Dining',
    rating: 4.9,
    reviewsCount: 850,
    distanceInKm: 1.2,
    distanceFormatted: '1.2 km away',
    excerpt: 'Award-winning farm-to-table French cuisine with panoramic rooftop terrace views of the city skyline.',
    description: 'Specializing in seasonal local produce, fresh pastries, and curated organic wines in an intimate, elegant setting.',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
    coordinates: {
      latitude: 48.8530,
      longitude: 2.3499,
    },
    sourceMetadata: {
      provider: 'Michelin Guide Partner Feed',
      author: 'Chef Antoine Laurent',
      license: 'Proprietary',
      sourceUrl: 'https://api.touristguide.example/v1/locations/loc-002',
    },
    isSaved: false,
  },
  {
    id: 'loc-003',
    title: 'Grand Palace Cultural Center',
    category: 'Cultural',
    rating: 4.7,
    reviewsCount: 1980,
    distanceInKm: 2.1,
    distanceFormatted: '2.1 km away',
    excerpt: 'Immersive modern art galleries, classical symphony performances, and historical artifact exhibitions.',
    description: 'Home to over 50,000 royal artifacts and world-renowned contemporary art installations housed within restored neoclassical halls.',
    imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&auto=format&fit=crop',
    coordinates: {
      latitude: 48.8606,
      longitude: 2.3376,
    },
    sourceMetadata: {
      provider: 'National Museum Open Data API',
      author: 'Ministry of Culture',
      license: 'CC0 Public Domain',
      sourceUrl: 'https://api.touristguide.example/v1/locations/loc-003',
    },
    isSaved: false,
  },
  {
    id: 'loc-004',
    title: 'Summer Music & Jazz Festival',
    category: 'Events',
    rating: 4.9,
    reviewsCount: 620,
    distanceInKm: 3.4,
    distanceFormatted: '3.4 km away',
    excerpt: 'Annual outdoor summer festival highlighting international jazz musicians and local street food vendors.',
    description: 'Enjoy live open-air acoustics under the stars along the riverfront promenade with artisanal food trucks and craft brews.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
    coordinates: {
      latitude: 48.8512,
      longitude: 2.3630,
    },
    sourceMetadata: {
      provider: 'City Event Wire API',
      author: 'Cultural Events Board',
      license: 'CC-BY-SA-4.0',
      sourceUrl: 'https://api.touristguide.example/v1/locations/loc-004',
    },
    isSaved: true,
  },
];
