import * as TaskManager from 'expo-task-manager';
import * as ExpoLocation from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { MOCK_LOCATIONS, calculateDistanceInMeters } from '@/constants/locations';

export const LOCATION_GEOFENCE_TASK = 'GEOFENCE_EXPLORATION_TASK';
const BADGES_STORE_KEY = 'unlocked_city_badges';

// Define Background Task
TaskManager.defineTask(LOCATION_GEOFENCE_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    if (!locations || locations.length === 0) return;

    const userCoords = locations[0].coords;

    // Check proximity to all landmark locations
    for (const landmark of MOCK_LOCATIONS) {
      const distanceMeters = calculateDistanceInMeters(
        userCoords.latitude,
        userCoords.longitude,
        landmark.coordinates.latitude,
        landmark.coordinates.longitude
      );

      // Within 50 meters radius constraint
      if (distanceMeters <= 50) {
        console.log(`📍 Geofence Hit: User is within ${Math.round(distanceMeters)}m of ${landmark.title}`);
        await handleLandmarkVisit(landmark);
      }
    }
  }
});

async function handleLandmarkVisit(landmark: any) {
  try {
    const rawBadges = await SecureStore.getItemAsync(BADGES_STORE_KEY);
    const unlockedList: string[] = rawBadges ? JSON.parse(rawBadges) : [];

    const badgeId = `badge-${landmark.category.toLowerCase()}`;

    if (!unlockedList.includes(badgeId)) {
      unlockedList.push(badgeId);
      await SecureStore.setItemAsync(BADGES_STORE_KEY, JSON.stringify(unlockedList));

      // Trigger Local Notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New City Badge Unlocked! 🏆',
          body: `You explored "${landmark.title}" and unlocked the ${landmark.category} Explorer badge! Check your Passport.`,
          sound: true,
        },
        trigger: null, // Immediate
      });
    }
  } catch (err) {
    console.error('Error unlocking geofence badge:', err);
  }
}

// Start Background Tracking Handler
export async function registerBackgroundGeofencing(): Promise<boolean> {
  try {
    const { status: fgStatus } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') return false;

    const { status: bgStatus } = await ExpoLocation.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') return false;

    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_GEOFENCE_TASK);
    if (!isRegistered) {
      await ExpoLocation.startLocationUpdatesAsync(LOCATION_GEOFENCE_TASK, {
        accuracy: ExpoLocation.Accuracy.Balanced,
        timeInterval: 10000, // 10 seconds
        distanceInterval: 20, // 20 meters
        foregroundService: {
          notificationTitle: 'TouristGuide Exploration',
          notificationBody: 'Tracking nearby landmarks for city badges in background.',
        },
      });
      console.log('✅ Registered background geofencing location task successfully.');
    }
    return true;
  } catch (error) {
    console.warn('Background geofencing registration skipped/failed:', error);
    return false;
  }
}
