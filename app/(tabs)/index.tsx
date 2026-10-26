import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  Heart,
  Send,
  Compass,
  X,
  Sparkles,
  Plus,
} from 'lucide-react-native';

import {
  Location,
  CategoryType,
  CATEGORIES,
} from '@/constants/locations';
import { Colors } from '@/constants/theme';
import { useExploreInfiniteQuery } from '@/services/api';
import { AIAssistantFAB } from '@/components/AIAssistantFAB';

// --- Category Color Map ---
const CATEGORY_COLOR_MAP: Record<CategoryType, { bg: string; border: string }> = {
  All: { bg: '#0F172A', border: '#0F172A' },          // Deep Slate
  Historical: { bg: '#8B5CF6', border: '#8B5CF6' },   // Bold Purple
  Cultural: { bg: '#4F46E5', border: '#4F46E5' },     // Vivid Indigo
  Dining: { bg: '#F59E0B', border: '#F59E0B' },       // Fiery Amber
  Events: { bg: '#FF5A5F', border: '#FF5A5F' },       // Electric Coral
};

// --- Sub-component: Location Card ---
interface LocationCardProps {
  item: Location;
  onToggleSave: (id: string) => void;
  onShare: (item: Location) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ item, onToggleSave, onShare }) => {
  const [imageError, setImageError] = useState(false);

  const categoryStyle = CATEGORY_COLOR_MAP[item.category as CategoryType] || {
    bg: '#FF5A5F',
    border: '#FF5A5F',
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      className="bg-white rounded-3xl mb-5 border border-slate-100 shadow-lg shadow-slate-200/60 overflow-hidden"
    >
      {/* Cover Image & Absolute Overlays */}
      <View className="relative h-52 w-full bg-slate-900">
        {!imageError ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="w-full h-full bg-slate-900 items-center justify-center">
            <Compass size={36} color="#00D1C4" />
            <Text className="text-slate-400 text-xs mt-2 font-medium">
              Image unavailable
            </Text>
          </View>
        )}

        {/* Absolute Positioned Category Badge Overlay */}
        <View
          className="absolute top-3.5 left-3.5 px-3.5 py-1 rounded-full shadow-md"
          style={{ backgroundColor: categoryStyle.bg }}
        >
          <Text className="text-white text-xs font-black tracking-widest uppercase">
            {item.category}
          </Text>
        </View>

        {/* High-Contrast Distance Badge Overlay */}
        <View className="absolute bottom-3.5 right-3.5 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full flex-row items-center gap-1 border border-white/20">
          <MapPin size={12} color="#00D1C4" />
          <Text className="text-white text-xs font-black">
            {item.distanceFormatted}
          </Text>
        </View>
      </View>

      {/* Card Body Details */}
      <View className="p-4.5">
        {/* Title & Star Rating */}
        <View className="flex-row items-start justify-between">
          <Text className="text-lg font-black text-slate-900 flex-1 mr-2 leading-snug">
            {item.title}
          </Text>
          <View className="flex-row items-center bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80">
            <Star size={13} color="#FFB800" fill="#FFB800" />
            <Text className="text-xs font-black text-amber-900 ml-1">
              {item.rating}
            </Text>
            <Text className="text-xs text-amber-700/80 ml-0.5 font-bold">
              ({item.reviewsCount})
            </Text>
          </View>
        </View>

        {/* Excerpt */}
        <Text className="text-slate-600 text-xs mt-2 leading-relaxed font-medium" numberOfLines={2}>
          {item.excerpt}
        </Text>

        {/* Action Button Row */}
        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <Text className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">
            Via {item.sourceMetadata.provider.split('&')[0]}
          </Text>

          <View className="flex-row items-center gap-2.5">
            {/* Outline Coral "Save" Heart Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onToggleSave(item.id)}
              className={`p-2.5 rounded-2xl items-center justify-center border ${
                item.isSaved
                  ? 'bg-rose-50 border-[#FF5A5F]'
                  : 'bg-white border-[#FF5A5F]'
              }`}
            >
              <Heart
                size={18}
                color="#FF5A5F"
                fill={item.isSaved ? '#FF5A5F' : 'none'}
              />
            </TouchableOpacity>

            {/* Solid Electric Teal "Share" Airplane Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onShare(item)}
              className="p-2.5 rounded-2xl bg-[#00D1C4] items-center justify-center shadow-md shadow-[#00D1C4]/30"
            >
              <Send size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Main Explore Screen Component ---
export default function ExploreScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedLocationIds, setSavedLocationIds] = useState<Set<string>>(new Set(['loc-001']));

  // TanStack Query Infinite Scrolling Hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useExploreInfiniteQuery(undefined, undefined, searchQuery, selectedCategory);

  // Flatten paged query data
  const locations = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) =>
      page.items.map((loc) => ({
        ...loc,
        isSaved: savedLocationIds.has(loc.id),
      }))
    );
  }, [data, savedLocationIds]);

  // Save Toggle handler
  const handleToggleSave = (id: string) => {
    setSavedLocationIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Open Share Preview
  const handleShare = (item: Location) => {
    router.push({
      pathname: '/share-preview',
      params: { locationId: item.id },
    });
  };

  return (
    <View className="flex-1 bg-[#F7F9FA] relative">
      {/* Top Header Container with Lush Electric Teal -> Deep Blue Gradient */}
      <LinearGradient
        colors={['#00D1C4', '#1E1B4B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-6 px-5 rounded-b-[36px] shadow-xl shadow-indigo-900/20 z-10"
      >
        <SafeAreaView edges={['top']}>
          {/* Header Greeting Row */}
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <View className="flex-row items-center gap-1.5">
                <Sparkles size={14} color="#00D1C4" />
                <Text className="text-xs font-extrabold text-teal-200 uppercase tracking-widest">
                  Good Morning, Explorer 👋
                </Text>
              </View>
              <Text className="text-2xl font-black text-white mt-0.5 tracking-tight">
                Discover Nearby
              </Text>
            </View>

            {/* Navigates to Add New Discovery Screen */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/add-spot')}
              className="flex-row items-center gap-1.5 bg-[#FF5A5F] px-3.5 py-2 rounded-2xl shadow-md shadow-[#FF5A5F]/40"
            >
              <Plus size={16} color="#ffffff" />
              <Text className="text-white text-xs font-black">Add Spot</Text>
            </TouchableOpacity>
          </View>

          {/* White Floating Search Bar with Pop-Out Soft Shadow */}
          <View className="flex-row items-center gap-2 mt-2">
            <View className="flex-1 flex-row items-center bg-white px-4 py-3 rounded-2xl shadow-lg shadow-black/15">
              <Search size={18} color="#00D1C4" />
              <TextInput
                className="flex-1 ml-2.5 text-slate-900 text-sm font-semibold"
                placeholder="Search a city, monument, or restaurant..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  className="p-1 rounded-full bg-slate-100"
                  activeOpacity={0.7}
                >
                  <X size={14} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#00D1C4] p-3.5 rounded-2xl items-center justify-center shadow-lg shadow-[#00D1C4]/30"
            >
              <SlidersHorizontal size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Horizontal Category Chips Filter with Distinct Bold Color Signatures */}
      <View className="py-3.5 px-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            const styleConfig = CATEGORY_COLOR_MAP[category];

            return (
              <TouchableOpacity
                key={category}
                activeOpacity={0.75}
                onPress={() => setSelectedCategory(category)}
                style={{
                  backgroundColor: isSelected ? styleConfig.bg : '#FFFFFF',
                  borderColor: isSelected ? styleConfig.border : '#E2E8F0',
                }}
                className={`px-4 py-2.5 rounded-2xl border ${
                  isSelected ? 'shadow-md shadow-slate-300' : ''
                }`}
              >
                <Text
                  className={`text-xs font-black tracking-wide ${
                    isSelected ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Vertical Scrolling Location Cards Feed */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#FF5A5F" />
          <Text className="text-slate-500 text-xs font-bold mt-3">
            Fetching nearby spots...
          </Text>
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LocationCard
              item={item}
              onToggleSave={handleToggleSave}
              onShare={handleShare}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 80,
          }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#FF5A5F"
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4 items-center justify-center">
                <ActivityIndicator size="small" color="#FF5A5F" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="py-16 items-center justify-center px-4">
              <View className="p-4 bg-rose-50 rounded-full mb-3">
                <Search size={32} color="#FF5A5F" />
              </View>
              <Text className="text-base font-black text-slate-800 text-center">
                No places found
              </Text>
              <Text className="text-xs text-slate-500 text-center mt-1 max-w-xs font-medium">
                We couldn't find any locations matching "{searchQuery}". Try searching for something else or reset filters.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-2.5 bg-[#FF5A5F] rounded-2xl shadow-sm"
              >
                <Text className="text-xs font-bold text-white">Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Floating AI Tour Guide Assistant FAB */}
      <AIAssistantFAB />
    </View>
  );
}
