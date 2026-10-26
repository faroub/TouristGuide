import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { Location, CategoryType, MOCK_LOCATIONS } from '@/constants/locations';
import {
  saveExploreFeedCache,
  getExploreFeedCache,
  enqueueOfflinePlace,
} from './offlineQueue';

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

// 1. Fetch Explore Locations API with Page Pagination & Local Cache Fallback
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

    const data: ExploreResponse = await response.json();
    // Cache successful network response locally for offline viewing
    await saveExploreFeedCache(data);
    return data;
  } catch (error) {
    console.warn('API request failed, attempting local cache fallback...');

    // Rule 1: Attempt to load last successfully cached payload from AsyncStorage
    const cachedData = await getExploreFeedCache();
    if (cachedData && cachedData.items?.length > 0) {
      console.log('📱 Loaded explore feed from device local AsyncStorage cache!');
      return cachedData;
    }

    // Default Mock Data Fallback
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

// 2. Submit User Generated Content (POST /api/v1/places) with Offline Queueing
export async function createPlace(payload: CreatePlacePayload): Promise<Location> {
  const netState = await NetInfo.fetch();

  // Rule 2: If offline, enqueue payload locally into OfflineQueue
  if (!netState.isConnected) {
    await enqueueOfflinePlace(payload);
    const mockOfflineSpot: Location = {
      id: `queued-spot-${Date.now()}`,
      title: payload.title,
      category: payload.category,
      rating: 5.0,
      reviewsCount: 1,
      distanceInKm: 0.1,
      distanceFormatted: '0.1 km away',
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
        provider: 'Offline Submission (Queued)',
        author: 'You',
        license: 'User Content',
        sourceUrl: 'https://mytravelapp.com',
      },
      isSaved: false,
    };

    MOCK_LOCATIONS.unshift(mockOfflineSpot);
    return mockOfflineSpot;
  }

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
    console.warn('Network creation failed, saving to offline queue:', error);
    await enqueueOfflinePlace(payload);

    const fallbackSpot: Location = {
      id: `fallback-spot-${Date.now()}`,
      title: payload.title,
      category: payload.category,
      rating: 5.0,
      reviewsCount: 1,
      distanceInKm: 0.1,
      distanceFormatted: '0.1 km away',
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

    MOCK_LOCATIONS.unshift(fallbackSpot);
    return fallbackSpot;
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
      queryClient.invalidateQueries({ queryKey: ['explore-locations'] });
    },
  });
}
