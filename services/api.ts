import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Location, CategoryType, MOCK_LOCATIONS } from '@/constants/locations';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://api.touristguide.example';

export interface ExploreQueryParams {
  lat?: number;
  lng?: number;
  query?: string;
  category?: CategoryType;
  page?: number;
  limit?: number;
}

export interface ExploreResponse {
  items: Location[];
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CreatePlacePayload {
  title: string;
  category: Exclude<CategoryType, 'All'>;
  description: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

// 1. Fetch Explore Locations API with Page Pagination
export async function fetchExploreLocations(
  params: ExploreQueryParams
): Promise<ExploreResponse> {
  const {
    lat,
    lng,
    query = '',
    category = 'All',
    page = 1,
    limit = 10,
  } = params;

  const searchParams = new URLSearchParams();
  if (lat !== undefined) searchParams.append('lat', lat.toString());
  if (lng !== undefined) searchParams.append('lng', lng.toString());
  if (query) searchParams.append('query', query);
  if (category && category !== 'All') searchParams.append('category', category);
  searchParams.append('page', page.toString());
  searchParams.append('limit', limit.toString());

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/explore?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Fallback handler for development / offline / mock mode
    console.warn('API request failed, using mock data fallback:', error);

    const filtered = MOCK_LOCATIONS.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });

    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(filtered.length / limit) || 1;

    return {
      items,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  }
}

// 2. Submit User Generated Content (POST /api/v1/places)
export async function createPlace(payload: CreatePlacePayload): Promise<Location> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('API place creation failed, using mock insertion fallback:', error);

    // Fallback local place creation
    const newLocation: Location = {
      id: `user-place-${Date.now()}`,
      title: payload.title,
      category: payload.category,
      rating: 5.0,
      reviewsCount: 1,
      distanceInKm: 0.5,
      distanceFormatted: '0.5 km away',
      excerpt: payload.description,
      description: payload.description,
      imageUrl:
        payload.imageUrl ||
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop',
      coordinates: {
        latitude: payload.latitude || 48.8566,
        longitude: payload.longitude || 2.3522,
      },
      sourceMetadata: {
        provider: 'Community Submission',
        author: 'You',
        license: 'User Content',
        sourceUrl: 'https://mytravelapp.com',
      },
      isSaved: false,
    };

    return newLocation;
  }
}

// 3. React Query Hook for Infinite Scroll Explore Feed
export function useExploreInfiniteQuery(
  lat?: number,
  lng?: number,
  query?: string,
  category?: CategoryType
) {
  return useInfiniteQuery<ExploreResponse>({
    queryKey: ['explore-locations', { lat, lng, query, category }],
    queryFn: ({ pageParam = 1 }) =>
      fetchExploreLocations({
        lat,
        lng,
        query,
        category,
        page: pageParam as number,
        limit: 10,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
  });
}

// 4. React Query Hook for Creating Place (UGC Loop)
export function useCreatePlaceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlace,
    onSuccess: (newPlace) => {
      // Optimistically update explore query cache or invalidate
      queryClient.invalidateQueries({ queryKey: ['explore-locations'] });
      // Prepend to MOCK_LOCATIONS so fallback stays in sync
      MOCK_LOCATIONS.unshift(newPlace);
    },
  });
}
