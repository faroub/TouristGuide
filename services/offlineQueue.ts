import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreatePlacePayload } from '@/services/api';

const OFFLINE_QUEUE_KEY = '@offline_place_queue';
const EXPLORE_CACHE_KEY = '@explore_feed_cache';

export interface QueuedItem {
  id: string;
  payload: CreatePlacePayload;
  timestamp: number;
}

// Save pending spot to offline queue
export async function enqueueOfflinePlace(payload: CreatePlacePayload): Promise<void> {
  try {
    const existing = await getOfflineQueue();
    const newItem: QueuedItem = {
      id: `queue-${Date.now()}`,
      payload,
      timestamp: Date.now(),
    };

    const updated = [...existing, newItem];
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
    console.log(`📦 Enqueued spot payload to offline storage queue (ID: ${newItem.id})`);
  } catch (error) {
    console.error('Error saving to offline queue:', error);
  }
}

// Retrieve all queued items
export async function getOfflineQueue(): Promise<QueuedItem[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error reading offline queue:', error);
    return [];
  }
}

// Clear offline queue
export async function clearOfflineQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing offline queue:', error);
  }
}

// Cache Explore Feed Response locally
export async function saveExploreFeedCache(data: any): Promise<void> {
  try {
    await AsyncStorage.setItem(EXPLORE_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching explore feed payload:', error);
  }
}

// Get Cached Explore Feed Response
export async function getExploreFeedCache(): Promise<any | null> {
  try {
    const raw = await AsyncStorage.getItem(EXPLORE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error reading cached explore feed:', error);
    return null;
  }
}
