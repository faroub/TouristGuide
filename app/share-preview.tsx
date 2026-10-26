import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
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
  Star,
  MapPin,
  Compass,
  QrCode,
  Sparkles,
  Check,
} from 'lucide-react-native';

import { MOCK_LOCATIONS, Location } from '@/constants/locations';
import { Colors } from '@/constants/theme';
import { shareLocationNative, generateLocationDeepLink } from '@/utils/share';

export default function SharePreviewScreen() {
  const router = useRouter();
  const { locationId } = useLocalSearchParams<{ locationId?: string }>();
  const viewShotRef = useRef<ViewShot | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Retrieve matching location or fallback
  const location: Location =
    MOCK_LOCATIONS.find((loc) => loc.id === locationId) || MOCK_LOCATIONS[0];

  const deepLink = generateLocationDeepLink(location.id);

  // Capture & Save Story Card to Gallery
  const handleSaveToGallery = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);

      // Request media library permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow media library access to save the story preview card to your photo gallery.'
        );
        setIsSaving(false);
        return;
      }

      // Capture screenshot of ViewShot container
      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);

        setSaveSuccess(true);
        Alert.alert(
          'Saved to Gallery! 📸',
          'Your Instagram-style story card has been saved to your photo gallery.'
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

        <Text className="text-white text-base font-bold">Share Location</Text>

        <View className="w-9" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
      >
        <Text className="text-slate-400 text-xs text-center mb-4 font-medium">
          Instagram-Story Preview Card
        </Text>

        {/* ViewShot Container to Capture Snapshot */}
        <View className="items-center justify-center">
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 0.98 }}
            style={{ width: '100%', maxWidth: 360 }}
          >
            <View className="w-full aspect-[9/16] bg-slate-900 rounded-3xl overflow-hidden relative border-2 border-slate-700/60 shadow-2xl">
              {/* Background Cover Image */}
              <Image
                source={{ uri: location.imageUrl }}
                className="w-full h-full absolute top-0 left-0"
                resizeMode="cover"
              />

              {/* Dark Gradient Overlay for Readability */}
              <View className="w-full h-full absolute top-0 left-0 bg-slate-950/40" />

              {/* Inner Decorative Border Frame */}
              <View className="absolute inset-4 rounded-2xl border border-white/25 pointer-events-none" />

              {/* Story Content Wrapper */}
              <View className="flex-1 p-7 justify-between relative z-10">
                {/* Branding Top Header */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2 bg-slate-950/70 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                    <Compass size={16} color={Colors.primary.DEFAULT} />
                    <Text className="text-white text-xs font-black tracking-widest uppercase">
                      TOURIST GUIDE
                    </Text>
                  </View>

                  <View className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                    <Sparkles size={16} color="#ffffff" />
                  </View>
                </View>

                {/* Center Location Card Details */}
                <View className="bg-slate-950/80 backdrop-blur-md p-5 rounded-2xl border border-white/15">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <View className="bg-blue-600 px-2.5 py-0.5 rounded-full">
                      <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                        {location.category}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                      <Star size={13} color={Colors.accent.star} fill={Colors.accent.star} />
                      <Text className="text-white text-xs font-bold">
                        {location.rating}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-white text-xl font-extrabold leading-tight mt-1">
                    {location.title}
                  </Text>

                  <View className="flex-row items-center gap-1 mt-2">
                    <MapPin size={12} color="#93c5fd" />
                    <Text className="text-blue-200 text-xs font-medium">
                      {location.distanceFormatted}
                    </Text>
                  </View>

                  <Text
                    className="text-slate-300 text-xs mt-2.5 leading-relaxed"
                    numberOfLines={2}
                  >
                    {location.excerpt}
                  </Text>
                </View>

                {/* Bottom Stylized QR Code & Deep Link Section */}
                <View className="flex-row items-center justify-between bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                  <View className="flex-1 pr-3">
                    <Text className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                      Scan to Explore
                    </Text>
                    <Text className="text-white text-xs font-bold mt-0.5" numberOfLines={1}>
                      mytravelapp.com
                    </Text>
                  </View>

                  {/* Stylized QR Code Graphic Container */}
                  <View className="bg-white p-2 rounded-xl shadow-md border border-slate-200 items-center justify-center">
                    <QrCode size={32} color="#0f172a" />
                  </View>
                </View>
              </View>
            </View>
          </ViewShot>
        </View>

        {/* Action Buttons Section */}
        <View className="mt-6 gap-3">
          {/* Invoke OS Native Share Sheet */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => shareLocationNative(location)}
            className="bg-blue-600 py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg"
          >
            <Share2 size={18} color="#ffffff" />
            <Text className="text-white text-sm font-bold">
              Share Link via OS Sheet
            </Text>
          </TouchableOpacity>

          {/* Save Story Card Image to Gallery */}
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
