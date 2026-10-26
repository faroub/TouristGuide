import { Share } from 'react-native';
import { Location } from '@/constants/locations';

export const APP_BASE_URL = 'https://mytravelapp.com';

export function generateLocationDeepLink(locationId: string): string {
  return `${APP_BASE_URL}/${locationId}`;
}

export function formatPunchyShareMessage(location: Location): string {
  const deepLink = generateLocationDeepLink(location.id);
  return `✨ Look what I just discovered using TravelApp! 📍 ${location.title} - ${location.excerpt}. Check it out here: ${deepLink}`;
}

export async function shareLocationUniversal(
  location: Location,
  capturedImageUri?: string
): Promise<void> {
  try {
    const message = formatPunchyShareMessage(location);

    // On iOS/Android, passing url or message opens native OS share sheet for any app
    await Share.share({
      title: `Discovered: ${location.title}`,
      message,
      url: capturedImageUri || generateLocationDeepLink(location.id),
    });
  } catch (error) {
    console.error('Error opening universal OS share sheet:', error);
  }
}
