import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Star, Filter, Heart } from 'lucide-react-native';

const CATEGORIES = ['All', 'Popular', 'Historic', 'Nature', 'Food & Drink', 'Culture'];

interface LocationItem {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  image: string;
}

const NEARBY_LOCATIONS: LocationItem[] = [
  {
    id: '1',
    title: 'Historic Old Town Square',
    category: 'Historic',
    rating: 4.8,
    reviews: 1240,
    distance: '0.8 km away',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Botanical Gardens & Conservatory',
    category: 'Nature',
    rating: 4.7,
    reviews: 890,
    distance: '1.5 km away',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Grand City Art Museum',
    category: 'Culture',
    rating: 4.9,
    reviews: 2150,
    distance: '2.3 km away',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600&auto=format&fit=crop',
  },
];

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-3 pb-2">
        <Text className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
          Explore City
        </Text>
        <Text className="text-2xl font-bold text-slate-900 mt-0.5">
          Find Nearby Places
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-5 py-2 flex-row items-center gap-2">
        <View className="flex-1 flex-row items-center bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
          <Search size={18} color="#64748b" />
          <TextInput
            className="flex-1 ml-2.5 text-slate-800 text-sm font-normal"
            placeholder="Search attractions, food, parks..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity className="bg-blue-600 p-3 rounded-2xl items-center justify-center">
          <Filter size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Scroll */}
      <View className="py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600'
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

      {/* Main Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
      >
        <View className="flex-row items-center justify-between mb-3 mt-1">
          <Text className="text-lg font-bold text-slate-900">
            Nearby Attractions
          </Text>
          <TouchableOpacity>
            <Text className="text-xs font-semibold text-blue-600">See All</Text>
          </TouchableOpacity>
        </View>

        {NEARBY_LOCATIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-white rounded-3xl mb-4 overflow-hidden border border-slate-100 shadow-sm"
            activeOpacity={0.8}
          >
            <View className="relative h-44 w-full bg-slate-200">
              <Image
                source={{ uri: item.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <TouchableOpacity className="absolute top-3 right-3 bg-white/80 p-2 rounded-full backdrop-blur-md">
                <Heart size={16} color="#0f172a" />
              </TouchableOpacity>
              <View className="absolute bottom-3 left-3 bg-slate-900/70 px-2.5 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">
                  {item.category}
                </Text>
              </View>
            </View>

            <View className="p-4">
              <Text className="text-base font-bold text-slate-900">
                {item.title}
              </Text>
              <View className="flex-row items-center justify-between mt-2">
                <View className="flex-row items-center gap-1">
                  <MapPin size={14} color="#64748b" />
                  <Text className="text-xs text-slate-500 font-medium">
                    {item.distance}
                  </Text>
                </View>

                <View className="flex-row items-center gap-1">
                  <Star size={14} color="#eab308" fill="#eab308" />
                  <Text className="text-xs font-bold text-slate-800">
                    {item.rating}
                  </Text>
                  <Text className="text-xs text-slate-400">
                    ({item.reviews})
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
