import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MapPin, Star, Heart, Send, Compass } from 'lucide-react-native';
import { Location } from '@/constants/locations';
import { Colors } from '@/constants/theme';

interface TravelDiscoveryCardProps {
  location: Location;
  onPressCard?: (location: Location) => void;
  onToggleSave?: (id: string) => void;
  onShare?: (location: Location) => void;
}

// Stitch Theme Badge Color Mapping
const STITCH_CATEGORY_COLORS: Record<string, string> = {
  Historical: Colors.themes.history,  // Vivid Purple (#8B5CF6)
  Cultural: Colors.themes.history,    // Vivid Purple (#8B5CF6)
  Dining: Colors.themes.dining,       // Fiery Amber (#F59E0B)
  Sightseeing: Colors.themes.sights,  // Neon Emerald (#10B981)
  Events: Colors.themes.events,       // Energetic Coral (#FF5A5F)
};

export const TravelDiscoveryCard: React.FC<TravelDiscoveryCardProps> = ({
  location,
  onPressCard,
  onToggleSave,
  onShare,
}) => {
  const [imageError, setImageError] = useState(false);

  const badgeColor =
    STITCH_CATEGORY_COLORS[location.category] || Colors.primary.DEFAULT;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPressCard && onPressCard(location)}
      className="bg-white rounded-fluid mb-5 border border-slate-100 shadow-lg shadow-slate-200/60 overflow-hidden"
    >
      {/* 2. Image Container with Absolute Top-Left Category Badge */}
      <View className="relative h-52 w-full bg-slate-900">
        {!imageError ? (
          <Image
            source={{ uri: location.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="w-full h-full bg-slate-900 items-center justify-center">
            <Compass size={36} color={Colors.secondary.DEFAULT} />
            <Text className="text-slate-400 text-xs mt-2 font-medium">
              Image unavailable
            </Text>
          </View>
        )}

        {/* Dynamic Category Badge Overlay (Stitch Token Styling) */}
        <View
          className="absolute top-3.5 left-3.5 px-3.5 py-1 rounded-full shadow-md"
          style={{ backgroundColor: badgeColor }}
        >
          <Text className="text-white text-xs font-black tracking-widest uppercase">
            {location.category}
          </Text>
        </View>

        {/* Distance Badge Overlay */}
        <View className="absolute bottom-3.5 right-3.5 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full flex-row items-center gap-1 border border-white/20">
          <MapPin size={12} color={Colors.secondary.DEFAULT} />
          <Text className="text-white text-xs font-black">
            {location.distanceFormatted}
          </Text>
        </View>
      </View>

      {/* 3. Body Content Stack */}
      <View className="p-4.5">
        <View className="flex-row items-start justify-between">
          <Text className="text-lg font-black text-slate-900 flex-1 mr-2 leading-snug">
            {location.title}
          </Text>

          {/* Rating Star Badge */}
          <View className="flex-row items-center bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80">
            <Star size={13} color={Colors.alerts.star} fill={Colors.alerts.star} />
            <Text className="text-xs font-black text-amber-900 ml-1">
              {location.rating}
            </Text>
            <Text className="text-xs text-amber-700/80 ml-0.5 font-bold">
              ({location.reviewsCount})
            </Text>
          </View>
        </View>

        {/* Excerpt Summary */}
        <Text className="text-slate-600 text-xs mt-2 leading-relaxed font-medium" numberOfLines={2}>
          {location.excerpt}
        </Text>

        {/* 4. Action Row: Outline Coral Heart + Solid Electric Teal Paper Airplane */}
        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <Text className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">
            Via {location.sourceMetadata.provider.split('&')[0]}
          </Text>

          <View className="flex-row items-center gap-2.5">
            {/* Outline Energetic Coral Heart Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onToggleSave && onToggleSave(location.id)}
              className={`p-2.5 rounded-2xl items-center justify-center border ${
                location.isSaved
                  ? 'bg-rose-50 border-coral'
                  : 'bg-white border-coral'
              }`}
            >
              <Heart
                size={18}
                color={Colors.primary.DEFAULT}
                fill={location.isSaved ? Colors.primary.DEFAULT : 'none'}
              />
            </TouchableOpacity>

            {/* Solid Electric Teal Paper Airplane Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onShare && onShare(location)}
              className="p-2.5 rounded-2xl bg-teal items-center justify-center shadow-md shadow-teal/30"
            >
              <Send size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
