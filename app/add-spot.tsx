import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoLocation from 'expo-location';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Compass,
} from 'lucide-react-native';

import { CategoryType, CATEGORIES } from '@/constants/locations';
import { Colors } from '@/constants/theme';
import { UGCImageSelector } from '@/components/UGCImageSelector';
import { useCreatePlaceMutation, API_BASE_URL } from '@/services/api';

const CATEGORY_CHIP_COLORS: Record<string, string> = {
  Historical: '#8B5CF6', // Bold Purple
  Cultural: '#4F46E5',   // Vivid Indigo
  Dining: '#F59E0B',     // Fiery Amber
  Events: '#FF5A5F',     // Electric Coral
};

export default function AddSpotScreen() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<CategoryType, 'All'>>('Historical');
  const [description, setDescription] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // GPS Coordinates State
  const [latitude, setLatitude] = useState<number>(48.8566);
  const [longitude, setLongitude] = useState<number>(2.3522);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(true);
  const [gpsCaptured, setGpsCaptured] = useState<boolean>(false);

  // Two-Step Submission States
  const [submissionStep, setSubmissionStep] = useState<
    'idle' | 'uploading-image' | 'saving-place'
  >('idle');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const createPlaceMutation = useCreatePlaceMutation();

  // 1. Capture Precise GPS Coordinates on Mount
  useEffect(() => {
    captureCurrentLocation();
  }, []);

  const captureCurrentLocation = async () => {
    setIsGpsLoading(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.High,
        });

        setLatitude(currentLocation.coords.latitude);
        setLongitude(currentLocation.coords.longitude);
        setGpsCaptured(true);
      }
    } catch (error) {
      console.warn('GPS capture warning:', error);
    } finally {
      setIsGpsLoading(false);
    }
  };

  // 2. Perform Step A: Multipart Upload Image to /api/v1/places/upload-image
  const uploadImageFile = async (uri: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/v1/places/upload-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      }
    } catch (error) {
      console.warn('Backend image upload failed, using local URI fallback:', error);
    }
    // Return local URI if backend upload fails/dev mock
    return uri;
  };

  // 3. Complete Two-Step Submission Handler
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for this discovery spot.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please add a brief description.');
      return;
    }

    try {
      let uploadedPublicUrl: string | undefined = undefined;

      // STEP A: Upload Image Asset if Selected
      if (selectedImageUri) {
        setSubmissionStep('uploading-image');
        const url = await uploadImageFile(selectedImageUri);
        if (url) {
          uploadedPublicUrl = url;
        }
      }

      // STEP B: Submit Complete Payload to /api/v1/places
      setSubmissionStep('saving-place');

      createPlaceMutation.mutate(
        {
          title: title.trim(),
          category,
          description: description.trim(),
          latitude,
          longitude,
          imageUrl: uploadedPublicUrl,
        },
        {
          onSuccess: () => {
            setSubmissionStep('idle');
            setShowSuccessModal(true);
          },
          onError: (error) => {
            setSubmissionStep('idle');
            Alert.alert(
              'Submission Error',
              error.message || 'Could not save the location. Please try again.'
            );
          },
        }
      );
    } catch (error) {
      setSubmissionStep('idle');
      Alert.alert('Error', 'An unexpected error occurred during submission.');
    }
  };

  const validCategories = CATEGORIES.filter(
    (c): c is Exclude<CategoryType, 'All'> => c !== 'All'
  );

  return (
    <View className="flex-1 bg-[#F7F9FA]">
      {/* Lush Electric Teal -> Deep Blue Top Header */}
      <LinearGradient
        colors={['#00D1C4', '#1E1B4B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-6 px-5 rounded-b-[32px] shadow-xl z-10"
      >
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2.5 rounded-full bg-black/20 border border-white/20"
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#ffffff" />
            </TouchableOpacity>

            <View className="items-center">
              <View className="flex-row items-center gap-1.5">
                <Sparkles size={14} color="#00D1C4" />
                <Text className="text-[10px] font-black text-teal-200 uppercase tracking-widest">
                  COMMUNITY DISCOVERY
                </Text>
              </View>
              <Text className="text-xl font-black text-white mt-0.5">
                Add New Spot
              </Text>
            </View>

            <View className="w-10" />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Form Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
      >
        {/* GPS Capture Status Pill */}
        <View className="mb-4 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MapPin size={16} color={gpsCaptured ? '#00D1C4' : '#FF5A5F'} />
            <Text className="text-slate-800 text-xs font-bold">
              {isGpsLoading
                ? 'Acquiring GPS coordinates...'
                : gpsCaptured
                ? `GPS Fixed (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
                : 'Default Coordinates Active'}
            </Text>
          </View>
          {isGpsLoading ? (
            <ActivityIndicator size="small" color="#FF5A5F" />
          ) : (
            <CheckCircle2 size={16} color="#00D1C4" />
          )}
        </View>

        {/* Title Input */}
        <View className="mb-4">
          <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Spot Name / Title *
          </Text>
          <TextInput
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 text-sm font-semibold shadow-sm"
            placeholder="e.g. Hidden Rooftop Viewpoint"
            placeholderTextColor="#94a3b8"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Category Toggles */}
        <View className="mb-4">
          <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Category *
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {validCategories.map((cat) => {
              const isSelected = category === cat;
              const chipColor = CATEGORY_CHIP_COLORS[cat] || '#FF5A5F';

              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  onPress={() => setCategory(cat)}
                  style={{
                    backgroundColor: isSelected ? chipColor : '#FFFFFF',
                    borderColor: isSelected ? chipColor : '#E2E8F0',
                  }}
                  className="px-4 py-2.5 rounded-2xl border shadow-sm"
                >
                  <Text
                    className={`text-xs font-black tracking-wide ${
                      isSelected ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reusable UGC Image Selector */}
        <UGCImageSelector
          imageUri={selectedImageUri}
          onSelectImage={setSelectedImageUri}
        />

        {/* Description Input */}
        <View className="mb-5">
          <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Description *
          </Text>
          <TextInput
            className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 text-sm font-medium min-h-[120px] shadow-sm"
            placeholder="Tell fellow travelers why this spot is special..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Submit Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={submissionStep !== 'idle'}
          className="bg-[#FF5A5F] py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg shadow-[#FF5A5F]/40 mb-8"
        >
          {submissionStep !== 'idle' ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white font-black text-sm">
                {submissionStep === 'uploading-image'
                  ? 'Uploading Image (Step 1/2)...'
                  : 'Saving Spot (Step 2/2)...'}
              </Text>
            </View>
          ) : (
            <>
              <Sparkles size={18} color="#ffffff" />
              <Text className="text-white font-black text-sm uppercase tracking-wider">
                Publish Discovery
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Celebratory Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          router.replace('/');
        }}
      >
        <View className="flex-1 bg-slate-950/70 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-2xl border border-slate-100">
            <View className="w-16 h-16 rounded-full bg-teal-100 items-center justify-center mb-3">
              <Compass size={36} color="#00D1C4" />
            </View>

            <Text className="text-2xl font-black text-slate-900 text-center">
              Success! 🎉
            </Text>

            <Text className="text-sm font-bold text-[#FF5A5F] text-center mt-1">
              Your spot is live! ✨
            </Text>

            <Text className="text-xs text-slate-500 text-center mt-2 leading-relaxed font-medium">
              Thank you for contributing to the community! Nearby travelers can now discover "{title}".
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setShowSuccessModal(false);
                setTitle('');
                setDescription('');
                setSelectedImageUri(null);
                router.replace('/');
              }}
              className="mt-6 bg-[#00D1C4] w-full py-4 rounded-2xl items-center justify-center shadow-md shadow-[#00D1C4]/30"
            >
              <Text className="text-white text-sm font-black">
                Back to Explore Feed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
