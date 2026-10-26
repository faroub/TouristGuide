import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark, Share2, Trash2 } from 'lucide-react-native';

const SAVED_ITEMS = [
  {
    id: '1',
    title: 'Historic Old Town Square',
    category: 'Historic',
    savedDate: 'Saved 2 days ago',
  },
  {
    id: '3',
    title: 'Grand City Art Museum',
    category: 'Culture',
    savedDate: 'Saved 1 week ago',
  },
];

export default function SavedScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-3 pb-3 border-b border-slate-200/60 bg-white">
        <Text className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
          Saved Spots
        </Text>
        <Text className="text-2xl font-bold text-slate-900 mt-0.5">
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
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex-row items-center justify-between"
            >
              <View className="flex-1 pr-3">
                <Text className="text-xs font-semibold text-blue-600 mb-1">
                  {item.category}
                </Text>
                <Text className="text-base font-bold text-slate-900">
                  {item.title}
                </Text>
                <Text className="text-xs text-slate-400 mt-1">
                  {item.savedDate}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity className="p-2 bg-slate-100 rounded-xl">
                  <Share2 size={16} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2 bg-rose-50 rounded-xl">
                  <Trash2 size={16} color="#e11d48" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="py-16 items-center justify-center">
            <Bookmark size={48} color="#cbd5e1" />
            <Text className="text-base font-semibold text-slate-700 mt-3">
              No saved spots yet
            </Text>
            <Text className="text-xs text-slate-400 text-center mt-1 max-w-xs">
              Bookmark your favorite locations while exploring to view them here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
