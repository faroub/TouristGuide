import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import {
  ArrowLeft,
  Share2,
  Download,
  Check,
  Send,
} from 'lucide-react-native';

import { MOCK_LOCATIONS, Location } from '@/constants/locations';
import { VibrantShareCard } from '@/components/VibrantShareCard';
import { shareLocationUniversal } from '@/utils/share';

export default function SharePreviewScreen() {
  const router = useRouter();
  const { locationId } = useLocalSearchParams<{ locationId?: string }>();
  const viewShotRef = useRef<ViewShot | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Retrieve matching location or fallback
  const location: Location =
    MOCK_LOCATIONS.find((loc) => loc.id === locationId) || MOCK_LOCATIONS[0];

  // Universal Share Sheet Invocation with Captured Graphic
  const handleUniversalShare = async () => {
    try {
      setIsCapturing(true);
      let imageUri: string | undefined;

      if (viewShotRef.current && viewShotRef.current.capture) {
        imageUri = await viewShotRef.current.capture();
      }

      await shareLocationUniversal(location, imageUri);
    } catch (error) {
      console.error('Error invoking universal share sheet:', error);
      // Fallback share without image
      await shareLocationUniversal(location);
    } finally {
      setIsCapturing(false);
    }
  };

  // Save Story Card to Photo Gallery
  const handleSaveToGallery = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow media library access to save the story preview card to your photo gallery.'
        );
        setIsSaving(false);
        return;
      }

      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);

        setSaveSuccess(true);
        Alert.alert(
          'Saved to Gallery! 📸',
          'Your Vibrant Sunset Story Card has been saved to your photo gallery.'
        );
      }
    } catch (error) {
      console.error('Error saving image to gallery:', error);
      Alert.alert('Save Failed', 'Could not save the image card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={['top', 'bottom']}>
      {/* Top Header Navigation */}
      <View className="px-5 py-3 flex-row items-center justify-between border-b border-slate-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full bg-slate-800/80"
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>

        <Text className="text-white text-base font-black">Universal Share</Text>

        <View className="w-9" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
      >
        <Text className="text-slate-400 text-xs text-center mb-4 font-bold uppercase tracking-wider">
          Vibrant Story Post Template
        </Text>

        {/* Reusable Vibrant Sunset Card Component */}
        <View className="items-center justify-center">
          <VibrantShareCard ref={viewShotRef} location={location} />
        </View>

        {/* Action Buttons Section */}
        <View className="mt-6 gap-3">
          {/* Universal Native OS Share Sheet Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleUniversalShare}
            disabled={isCapturing}
            className="bg-[#00D1C4] py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg shadow-[#00D1C4]/30"
          >
            {isCapturing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Send size={18} color="#ffffff" />
                <Text className="text-white text-sm font-black">
                  Share Graphic & Link via System OS
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Save Story Card Image to Photo Gallery Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSaveToGallery}
            disabled={isSaving}
            className={`py-4 rounded-2xl items-center justify-center flex-row gap-2 border ${
              saveSuccess
                ? 'bg-emerald-600 border-emerald-500'
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : saveSuccess ? (
              <>
                <Check size={18} color="#ffffff" />
                <Text className="text-white text-sm font-bold">
                  Saved to Gallery!
                </Text>
              </>
            ) : (
              <>
                <Download size={18} color="#ffffff" />
                <Text className="text-white text-sm font-bold">
                  Save Story Card to Gallery
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
