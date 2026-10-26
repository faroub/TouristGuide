import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, AlertCircle, Sparkles } from 'lucide-react-native';

interface UGCImageSelectorProps {
  imageUri: string | null;
  onSelectImage: (uri: string | null) => void;
}

export const UGCImageSelector: React.FC<UGCImageSelectorProps> = ({
  imageUri,
  onSelectImage,
}) => {
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
  const [permissionType, setPermissionType] = useState<'camera' | 'gallery'>('camera');

  // Handle Camera Capture
  const handleLaunchCamera = async () => {
    setIsOptionModalVisible(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setPermissionType('camera');
      setIsPermissionModalVisible(true);
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        onSelectImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error launching camera:', error);
    }
  };

  // Handle Gallery Selection
  const handleLaunchGallery = async () => {
    setIsOptionModalVisible(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setPermissionType('gallery');
      setIsPermissionModalVisible(true);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        onSelectImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image from gallery:', error);
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        Cover Photo
      </Text>

      {imageUri ? (
        /* Image Preview Card with Remove Button Overlay */
        <View className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Delete / Remove Overlay Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onSelectImage(null)}
            className="absolute top-3 right-3 bg-slate-950/80 p-2 rounded-full border border-white/20"
          >
            <X size={16} color="#ffffff" />
          </TouchableOpacity>

          <View className="absolute bottom-3 left-3 bg-[#FF5A5F] px-3 py-1 rounded-full">
            <Text className="text-white text-[10px] font-black uppercase tracking-wider">
              Photo Selected
            </Text>
          </View>
        </View>
      ) : (
        /* Energetic Dotted Coral Border Slot */
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsOptionModalVisible(true)}
          className="h-36 w-full rounded-2xl border-2 border-dashed border-[#FF5A5F] bg-rose-50/50 items-center justify-center p-4 shadow-sm"
        >
          <View className="w-12 h-12 rounded-2xl bg-[#FF5A5F]/10 items-center justify-center mb-2">
            <Camera size={24} color="#FF5A5F" />
          </View>
          <Text className="text-slate-900 font-extrabold text-sm text-center">
            Upload Cover Photo
          </Text>
          <Text className="text-slate-500 text-xs text-center mt-0.5 font-medium">
            Tap to take a photo or select from gallery
          </Text>
        </TouchableOpacity>
      )}

      {/* Android-Optimized Action Dialog Modal */}
      <Modal
        visible={isOptionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOptionModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOptionModalVisible(false)}
          className="flex-1 bg-slate-950/50 justify-end"
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white rounded-t-3xl p-6 border-t border-slate-100 shadow-2xl"
          >
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-4" />

            <Text className="text-lg font-black text-slate-900 text-center mb-1">
              Select Photo Source
            </Text>
            <Text className="text-xs text-slate-500 text-center mb-5 font-medium">
              Choose how you want to add a picture for this spot
            </Text>

            <View className="gap-3 mb-2">
              {/* Option 1: Take Photo */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLaunchCamera}
                className="flex-row items-center gap-3.5 bg-rose-50 p-4 rounded-2xl border border-[#FF5A5F]/20"
              >
                <View className="p-2.5 rounded-xl bg-[#FF5A5F]">
                  <Camera size={20} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-extrabold text-sm">
                    Take Photo with Camera
                  </Text>
                  <Text className="text-slate-500 text-xs font-medium">
                    Capture a new picture right now
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Option 2: Gallery */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLaunchGallery}
                className="flex-row items-center gap-3.5 bg-teal-50 p-4 rounded-2xl border border-[#00D1C4]/20"
              >
                <View className="p-2.5 rounded-xl bg-[#00D1C4]">
                  <ImageIcon size={20} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-extrabold text-sm">
                    Choose from Photo Gallery
                  </Text>
                  <Text className="text-slate-500 text-xs font-medium">
                    Pick an existing image from your device
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsOptionModalVisible(false)}
              className="mt-3 py-3 rounded-2xl bg-slate-100 items-center justify-center"
            >
              <Text className="text-slate-700 font-bold text-sm">Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Permission Explanation Modal */}
      <Modal
        visible={isPermissionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPermissionModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsPermissionModalVisible(false)}
          className="flex-1 bg-slate-950/60 justify-center px-6"
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100"
          >
            <View className="w-12 h-12 rounded-2xl bg-rose-100 items-center justify-center mb-3 self-center">
              <AlertCircle size={28} color="#FF5A5F" />
            </View>

            <Text className="text-xl font-black text-slate-900 text-center">
              Permission Needed
            </Text>

            <Text className="text-slate-600 text-xs text-center mt-2 leading-relaxed font-medium">
              To upload cover photos for community spots, TravelApp needs access to your{' '}
              {permissionType === 'camera' ? 'camera' : 'photo gallery'}.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsPermissionModalVisible(false)}
              className="mt-5 bg-[#FF5A5F] py-3.5 rounded-2xl items-center justify-center shadow-md shadow-[#FF5A5F]/30"
            >
              <Text className="text-white text-sm font-bold">Got it</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
