import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Share,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  Bookmark,
  Share2,
  Compass,
  X,
  Sparkles,
} from 'lucide-react-native';

import {
  Location,
  CategoryType,
  CATEGORIES,
  MOCK_LOCATIONS,
} from '@/constants/locations';
import { Colors } from '@/constants/theme';

// --- Sub-component: Location Card ---
interface LocationCardProps {
  item: Location;
  onToggleSave: (id: string) => void;
  onShare: (item: Location) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ item, onToggleSave, onShare }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      className="bg-white rounded-3xl mb-5 border border-slate-100 shadow-sm overflow-hidden"
    >
      {/* Cover Image & Overlay Badges */}
      <View className="relative h-48 w-full bg-slate-200">
        {!imageError ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="w-full h-full bg-slate-800 items-center justify-center">
            <Compass size={36} color="#94a3b8" />
            <Text className="text-slate-400 text-xs mt-2 font-medium">
              Image unavailable
            </Text>
          </View>
        )}

        {/* Top Floating Badge Row */}
        <View className="absolute top-3 left-3 right-3 flex-row items-center justify-between">
          <View className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold tracking-wide">
              {item.category}
            </Text>
          </View>

          <View className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex-row items-center gap-1 shadow-sm">
            <MapPin size={12} color={Colors.primary.DEFAULT} />
            <Text className="text-slate-800 text-xs font-bold">
              {item.distanceFormatted}
            </Text>
          </View>
        </View>
      </View>

      {/* Card Content Details */}
      <View className="p-4">
        {/* Title & Rating */}
        <View className="flex-row items-start justify-between">
          <Text className="text-lg font-bold text-slate-900 flex-1 mr-2 leading-tight">
            {item.title}
          </Text>
          <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
            <Star size={13} color={Colors.accent.star} fill={Colors.accent.star} />
            <Text className="text-xs font-bold text-amber-900 ml-1">
              {item.rating}
            </Text>
            <Text className="text-xs text-amber-700/80 ml-0.5">
              ({item.reviewsCount})
            </Text>
          </View>
        </View>

        {/* Excerpt */}
        <Text className="text-slate-600 text-xs mt-2 leading-relaxed" numberOfLines={2}>
          {item.excerpt}
        </Text>

        {/* Action Buttons Row */}
        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <Text className="text-[11px] text-slate-400 font-medium">
            Via {item.sourceMetadata.provider.split('&')[0]}
          </Text>

          <View className="flex-row items-center gap-2">
            {/* Share Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onShare(item)}
              className="p-2.5 rounded-full bg-slate-100 items-center justify-center"
            >
              <Share2 size={16} color="#475569" />
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onToggleSave(item.id)}
              className={`p-2.5 rounded-full items-center justify-center ${
                item.isSaved ? 'bg-blue-50 border border-blue-200' : 'bg-slate-100'
              }`}
            >
              <Bookmark
                size={16}
                color={item.isSaved ? Colors.primary.DEFAULT : '#475569'}
                fill={item.isSaved ? Colors.primary.DEFAULT : 'none'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Main Explore Screen Component ---
export default function ExploreScreen() {
  const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle Save Toggle
  const handleToggleSave = (id: string) => {
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === id ? { ...loc, isSaved: !loc.isSaved } : loc
      )
    );
  };

  // Handle Native Share
  const handleShare = async (item: Location) => {
    try {
      await Share.share({
        title: item.title,
        message: `Check out "${item.title}" on Tourist Guide! ${item.excerpt}`,
        url: item.sourceMetadata.sourceUrl,
      });
    } catch (error) {
      console.error('Error sharing location:', error);
    }
  };

  // Filter Locations by Search and Category
  const filteredLocations = useMemo(() => {
    return locations.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [locations, selectedCategory, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* Sticky Top Header */}
      <View className="bg-slate-50 px-5 pt-3 pb-2 border-b border-slate-200/50 z-10">
        {/* Welcome Text */}
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <View className="flex-row items-center gap-1.5">
              <Sparkles size={14} color={Colors.primary.DEFAULT} />
              <Text className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Discover Nearby
              </Text>
            </View>
            <Text className="text-2xl font-extrabold text-slate-900 mt-0.5">
              Explore City
            </Text>
          </View>

          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center border border-blue-200">
            <Compass size={22} color={Colors.primary.DEFAULT} />
          </View>
        </View>

        {/* Stylized Search Bar */}
        <View className="flex-row items-center gap-2 mt-1 mb-1">
          <View className="flex-1 flex-row items-center bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
            <Search size={18} color="#64748b" />
            <TextInput
              className="flex-1 ml-2.5 text-slate-800 text-sm font-normal"
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
            className="bg-blue-600 p-3 rounded-2xl items-center justify-center shadow-sm"
          >
            <SlidersHorizontal size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Horizontal Category Chips Filter */}
        <View className="mt-2 py-1">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full border ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 shadow-sm'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
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
      </View>

      {/* Vertical Scrolling Location Cards List */}
      <FlatList
        data={filteredLocations}
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
          paddingTop: 16,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="py-16 items-center justify-center px-4">
            <View className="p-4 bg-slate-100 rounded-full mb-3">
              <Search size={32} color="#94a3b8" />
            </View>
            <Text className="text-base font-bold text-slate-800 text-center">
              No places found
            </Text>
            <Text className="text-xs text-slate-500 text-center mt-1 max-w-xs">
              We couldn't find any locations matching "{searchQuery}". Try searching for something else or reset filters.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 rounded-xl"
            >
              <Text className="text-xs font-semibold text-white">Reset Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
