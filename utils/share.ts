import { Share } from 'react-native';
import { Location } from '@/constants/locations';

export const APP_BASE_URL = 'https://mytravelapp.com';

export function generateLocationDeepLink(locationId: string): string {
  return `${APP_BASE_URL}/location/${locationId}`;
}

export function formatShareMessage(location: Location): string {
  const deepLink = generateLocationDeepLink(location.id);
  return `Explore "${location.title}" on Tourist Guide! ${location.excerpt}\n\nCheck it out here: ${deepLink}`;
}

export async function shareLocationNative(location: Location): Promise<void> {
  try {
    const message = formatShareMessage(location);
    const deepLink = generateLocationDeepLink(location.id);

    await Share.share({
      title: `Discover ${location.title}`,
      message,
      url: deepLink,
    });
  } catch (error) {
    console.error('Error invoking native share sheet:', error);
  }
}
