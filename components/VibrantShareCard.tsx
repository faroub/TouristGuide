import React, { forwardRef, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { Star, MapPin, Compass, Sparkles, QrCode } from 'lucide-react-native';
import { Location } from '@/constants/locations';

interface VibrantShareCardProps {
  location: Location;
}

export const VibrantShareCard = forwardRef<ViewShot, VibrantShareCardProps>(
  ({ location }, ref) => {
    const [imageError, setImageError] = useState(false);

    return (
      <ViewShot
        ref={ref}
        options={{ format: 'png', quality: 0.98 }}
        style={{ width: '100%', maxWidth: 360 }}
      >
        <LinearGradient
          colors={['#FF5A5F', '#FF8E53', '#7C3AED']} // Vibrant Sunset Gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-full aspect-[9/16] rounded-[32px] p-6 justify-between border-4 border-white/20 shadow-2xl relative overflow-hidden"
        >
          {/* Top App Branding Header */}
          <View className="flex-row items-center justify-between z-10">
            <View className="flex-row items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/30 backdrop-blur-md">
              <Compass size={16} color="#00D1C4" />
              <Text className="text-white text-xs font-black tracking-widest uppercase">
                TRAVELAPP
              </Text>
            </View>

            <View className="bg-white/20 p-2 rounded-full backdrop-blur-md border border-white/30">
              <Sparkles size={16} color="#ffffff" />
            </View>
          </View>

          {/* Framed Location Cover Photo Container */}
          <View className="relative h-[48%] w-full rounded-2xl overflow-hidden border-2 border-white/40 shadow-xl my-2 bg-slate-900">
            {!imageError ? (
              <Image
                source={{ uri: location.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View className="w-full h-full bg-slate-900 items-center justify-center p-4">
                <Compass size={32} color="#00D1C4" />
                <Text className="text-white text-xs mt-2 font-bold text-center">
                  {location.title}
                </Text>
              </View>
            )}

            {/* Category Badge Overlay */}
            <View className="absolute top-3 left-3 bg-[#FF5A5F] px-3 py-1 rounded-full shadow-md">
              <Text className="text-white text-[10px] font-black uppercase tracking-wider">
                {location.category}
              </Text>
            </View>
          </View>

          {/* Location Content Details Card */}
          <View className="bg-slate-950/85 backdrop-blur-md p-4 rounded-2xl border border-white/20 z-10">
            <View className="flex-row items-start justify-between">
              <Text className="text-white text-lg font-black leading-snug flex-1 mr-2">
                {location.title}
              </Text>
              <View className="flex-row items-center bg-amber-400/20 px-2 py-0.5 rounded-lg border border-amber-400/40">
                <Star size={12} color="#FFB800" fill="#FFB800" />
                <Text className="text-amber-300 text-xs font-black ml-1">
                  {location.rating}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-1 mt-1.5">
              <MapPin size={12} color="#00D1C4" />
              <Text className="text-teal-200 text-xs font-extrabold">
                {location.distanceFormatted}
              </Text>
            </View>

            <Text
              className="text-slate-300 text-xs mt-1.5 leading-relaxed font-medium"
              numberOfLines={2}
            >
              {location.excerpt}
            </Text>
          </View>

          {/* Bottom QR Code & Tagline Footer */}
          <View className="flex-row items-center justify-between bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/20 z-10">
            <View className="flex-1 pr-2">
              <Text className="text-slate-300 text-[10px] uppercase font-bold tracking-wider">
                Explore More On
              </Text>
              <Text className="text-white text-xs font-black mt-0.5">
                mytravelapp.com/{location.id}
              </Text>
            </View>

            <View className="bg-white p-1.5 rounded-xl border border-slate-200">
              <QrCode size={26} color="#0F172A" />
            </View>
          </View>
        </LinearGradient>
      </ViewShot>
    );
  }
);

VibrantShareCard.displayName = 'VibrantShareCard';
