import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {
  Bookmark,
  Trash2,
  Sparkles,
  Compass,
  MapPin,
  Star,
  Share2,
  ArrowRight,
} from 'lucide-react-native';

import { Location, MOCK_LOCATIONS, CategoryType } from '@/constants/locations';

const CATEGORY_COLOR_MAP: Record<string, string> = {
  Historical: '#8B5CF6', // Bold Purple
  Cultural: '#4F46E5',   // Vivid Indigo
  Dining: '#F59E0B',     // Fiery Amber
  Events: '#FF5A5F',     // Electric Coral
};

export default function SavedScreen() {
  const router = useRouter();
  const [savedItems, setSavedItems] = useState<Location[]>(
    MOCK_LOCATIONS.filter((item) => item.isSaved)
  );

  // Handle Swipe-to-Delete
  const handleDeleteItem = (id: string, title: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
    Alert.alert('Bookmark Removed', `"${title}" has been removed from your saved list.`);
  };

  // Render Right Actions (Crimson Red Panel with Trash Icon)
  const renderRightActions = (id: string, title: string) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleDeleteItem(id, title)}
        className="bg-[#E11D48] w-24 mb-5 rounded-r-3xl justify-center items-center flex-row gap-1 shadow-md shadow-rose-900/30"
      >
        <Trash2 size={22} color="#ffffff" />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#F7F9FA]">
      {/* Electric Teal Gradient Header */}
      <LinearGradient
        colors={['#00D1C4', '#1E1B4B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-6 px-5 rounded-b-[36px] shadow-xl shadow-teal-900/20 z-10"
      >
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center justify-between">
            <View>
              <View className="flex-row items-center gap-1.5">
                <Sparkles size={14} color="#00D1C4" />
                <Text className="text-xs font-extrabold text-teal-200 uppercase tracking-widest">
                  SAVED SPOTS & BOOKMARKS
                </Text>
              </View>
              <Text className="text-2xl font-black text-white mt-0.5 tracking-tight">
                Your Discoveries
              </Text>
            </View>

            <View className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md items-center justify-center border border-white/20">
              <Bookmark size={20} color="#00D1C4" fill="#00D1C4" />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Saved Items List or Empty State */}
      <FlatList
        data={savedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const categoryColor = CATEGORY_COLOR_MAP[item.category] || '#FF5A5F';

          return (
            <Swipeable
              renderRightActions={() => renderRightActions(item.id, item.title)}
              overshootRight={false}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                className="bg-white rounded-3xl mb-5 border border-slate-100 shadow-md shadow-slate-200/50 overflow-hidden flex-row h-36"
              >
                {/* Left Cover Image */}
                <View className="w-32 h-full bg-slate-900 relative">
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: categoryColor }}
                  >
                    <Text className="text-white text-[9px] font-black uppercase tracking-wider">
                      {item.category}
                    </Text>
                  </View>
                </View>

                {/* Right Item Info */}
                <View className="flex-1 p-3.5 justify-between">
                  <View>
                    <View className="flex-row items-start justify-between">
                      <Text
                        className="text-base font-black text-slate-900 flex-1 mr-1 leading-snug"
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <View className="flex-row items-center bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                        <Star size={11} color="#FFB800" fill="#FFB800" />
                        <Text className="text-[11px] font-extrabold text-amber-900 ml-0.5">
                          {item.rating}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-1 mt-1">
                      <MapPin size={12} color="#00D1C4" />
                      <Text className="text-slate-500 text-xs font-bold">
                        {item.distanceFormatted}
                      </Text>
                    </View>

                    <Text
                      className="text-slate-500 text-[11px] mt-1.5 font-medium leading-relaxed"
                      numberOfLines={2}
                    >
                      {item.excerpt}
                    </Text>
                  </View>

                  {/* Swipe Guidance Footer */}
                  <View className="flex-row items-center justify-between border-t border-slate-100 pt-2">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Swipe left to remove
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: '/share-preview',
                          params: { locationId: item.id },
                        })
                      }
                      className="p-1 rounded-full bg-slate-100"
                    >
                      <Share2 size={12} color="#475569" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          );
        }}
        ListEmptyComponent={
          <View className="py-20 items-center justify-center px-6">
            {/* Colorful Stylized Compass Vector Container */}
            <View className="w-24 h-24 rounded-full bg-teal-100 items-center justify-center mb-4 border-2 border-teal-200 shadow-md">
              <View className="w-16 h-16 rounded-full bg-[#00D1C4] items-center justify-center shadow-lg">
                <Compass size={36} color="#ffffff" />
              </View>
            </View>

            <Text className="text-2xl font-black text-slate-900 text-center">
              Your itinerary is empty! 🌟
            </Text>

            <Text className="text-xs text-slate-500 text-center mt-2 leading-relaxed max-w-xs font-medium">
              You haven't bookmarked any discoveries yet. Explore nearby attractions and tap the heart icon to save them here!
            </Text>

            {/* High-Contrast Coral Route Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)')}
              className="mt-6 bg-[#FF5A5F] px-6 py-3.5 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg shadow-[#FF5A5F]/40"
            >
              <Text className="text-white text-xs font-black uppercase tracking-wider">
                Explore Nearby Spots
              </Text>
              <ArrowRight size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
