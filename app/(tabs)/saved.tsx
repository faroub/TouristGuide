import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark, Share2, Trash2, Sparkles } from 'lucide-react-native';

const SAVED_ITEMS = [
  {
    id: '1',
    title: 'Historic Old Town Square',
    category: 'Historic',
    savedDate: 'Saved 2 days ago',
  },
  {
    id: '3',
    title: 'Grand Palace Cultural Center',
    category: 'Culture',
    savedDate: 'Saved 1 week ago',
  },
];

export default function SavedScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FA]" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-3 pb-3 border-b border-slate-200/60 bg-white">
        <View className="flex-row items-center gap-1.5">
          <Sparkles size={14} color="#FF5A5F" />
          <Text className="text-xs font-extrabold text-[#FF5A5F] uppercase tracking-wider">
            Saved Spots
          </Text>
        </View>
        <Text className="text-2xl font-black text-slate-900 mt-0.5">
          Your Bookmarks
        </Text>
      </View>

      {/* Bookmarked Spots List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, gap: 12 }}
      >
        {SAVED_ITEMS.length > 0 ? (
          SAVED_ITEMS.map((item) => (
            <View
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-row items-center justify-between"
            >
              <View className="flex-1 pr-3">
                <Text className="text-xs font-bold text-[#00D1C4] uppercase tracking-wider mb-1">
                  {item.category}
                </Text>
                <Text className="text-base font-bold text-slate-900">
                  {item.title}
                </Text>
                <Text className="text-xs text-slate-400 font-medium mt-1">
                  {item.savedDate}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity className="p-2.5 bg-slate-100 rounded-xl">
                  <Share2 size={16} color="#475569" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2.5 bg-rose-50 rounded-xl">
                  <Trash2 size={16} color="#FF5A5F" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="py-16 items-center justify-center">
            <View className="p-4 bg-rose-50 rounded-full mb-3">
              <Bookmark size={36} color="#FF5A5F" />
            </View>
            <Text className="text-base font-black text-slate-800 mt-1">
              No saved spots yet
            </Text>
            <Text className="text-xs text-slate-400 text-center mt-1 max-w-xs font-medium">
              Bookmark your favorite locations while exploring to view them here anytime.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
