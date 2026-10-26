import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation, Layers } from 'lucide-react-native';

export default function MapScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={['top']}>
      {/* Map Header Overlay */}
      <View className="px-5 pt-3 pb-2 bg-white/90 border-b border-slate-200 flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Map Explorer
          </Text>
          <Text className="text-xl font-bold text-slate-900">
            Interactive View
          </Text>
        </View>

        <TouchableOpacity className="p-2.5 bg-slate-100 rounded-2xl">
          <Layers size={20} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* Map View Placeholder */}
      <View className="flex-1 bg-slate-200 items-center justify-center p-6 relative">
        <View className="items-center justify-center">
          <View className="bg-blue-600/10 p-6 rounded-full mb-3 items-center justify-center">
            <View className="bg-blue-600 p-4 rounded-full shadow-lg">
              <MapPin size={32} color="#ffffff" />
            </View>
          </View>
          <Text className="text-base font-bold text-slate-800 text-center">
            Geographic Explorer
          </Text>
          <Text className="text-xs text-slate-500 text-center mt-1 max-w-xs">
            Integrate react-native-maps or Mapbox to visualize points of interest and live navigation.
          </Text>
        </View>

        {/* Floating Controls */}
        <View className="absolute bottom-6 right-6 gap-3">
          <TouchableOpacity className="bg-white p-3.5 rounded-full shadow-md items-center justify-center border border-slate-100">
            <Navigation size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
