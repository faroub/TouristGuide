import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  Award,
  Lock,
  Sparkles,
  Landmark,
  Utensils,
  Music,
  Compass,
  Check,
  Zap,
} from 'lucide-react-native';

import { registerBackgroundGeofencing } from '@/services/backgroundGeofence';

const BADGES_STORE_KEY = 'unlocked_city_badges';

export interface CityBadge {
  id: string;
  title: string;
  category: string;
  description: string;
  colors: [string, string, ...string[]];
  renderIcon: (color: string) => React.ReactNode;
}

const CITY_BADGES: CityBadge[] = [
  {
    id: 'badge-historical',
    title: 'Historic Explorer',
    category: 'Historical',
    description: 'Visited 3+ ancient monuments & Gothic squares',
    colors: ['#8B5CF6', '#6D28D9'],
    renderIcon: (color) => <Landmark size={28} color={color} />,
  },
  {
    id: 'badge-dining',
    title: 'Gourmet Critic',
    category: 'Dining',
    description: 'Discovered farm-to-table culinary hotspots',
    colors: ['#F59E0B', '#D97706'],
    renderIcon: (color) => <Utensils size={28} color={color} />,
  },
  {
    id: 'badge-cultural',
    title: 'Cultural Aficionado',
    category: 'Cultural',
    description: 'Explored grand art galleries & museums',
    colors: ['#4F46E5', '#3730A3'],
    renderIcon: (color) => <Sparkles size={28} color={color} />,
  },
  {
    id: 'badge-events',
    title: 'Event Enthusiast',
    category: 'Events',
    description: 'Attended live open-air summer jazz festivals',
    colors: ['#FF5A5F', '#E03E43'],
    renderIcon: (color) => <Music size={28} color={color} />,
  },
  {
    id: 'badge-sightseeing',
    title: 'City Pioneer',
    category: 'Sightseeing',
    description: 'Scouted top panoramic rooftop viewpoints',
    colors: ['#00D1C4', '#00A89E'],
    renderIcon: (color) => <Compass size={28} color={color} />,
  },
  {
    id: 'badge-pioneer',
    title: 'Master Voyager',
    category: 'Achievement',
    description: 'Submitted user-generated spots to the map',
    colors: ['#10B981', '#047857'],
    renderIcon: (color) => <Award size={28} color={color} />,
  },
];

// --- Badge Item Component with Reanimated Scale & Neon Glow ---
interface BadgeCardProps {
  badge: CityBadge;
  isUnlocked: boolean;
  onToggleUnlock: (id: string) => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  isUnlocked,
  onToggleUnlock,
}) => {
  const scale = useSharedValue(isUnlocked ? 1 : 0.95);

  useEffect(() => {
    scale.value = withSpring(isUnlocked ? 1.02 : 0.95, {
      damping: 12,
      stiffness: 120,
    });
  }, [isUnlocked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle} className="w-[48%] mb-4">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onToggleUnlock(badge.id)}
        className="rounded-3xl overflow-hidden"
      >
        {isUnlocked ? (
          /* Unlocked Vibrant Gradient Pill with Neon Glow Shadow */
          <LinearGradient
            colors={badge.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-4 h-48 justify-between rounded-3xl border-2 border-white/30 shadow-xl shadow-purple-900/30 relative"
          >
            {/* Top Unlocked Badge Header */}
            <View className="flex-row items-center justify-between">
              <View className="bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                <Text className="text-white text-[10px] font-black uppercase tracking-wider">
                  UNLOCKED
                </Text>
              </View>

              <View className="w-6 h-6 rounded-full bg-white/25 items-center justify-center">
                <Check size={14} color="#ffffff" />
              </View>
            </View>

            {/* Center Icon */}
            <View className="self-center bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/25 my-1">
              {badge.renderIcon('#ffffff')}
            </View>

            {/* Bottom Title & Description */}
            <View>
              <Text className="text-white font-black text-sm leading-snug">
                {badge.title}
              </Text>
              <Text
                className="text-white/80 text-[10px] font-medium leading-tight mt-1"
                numberOfLines={2}
              >
                {badge.description}
              </Text>
            </View>
          </LinearGradient>
        ) : (
          /* Locked Grayscale State */
          <View className="p-4 h-48 justify-between rounded-3xl bg-slate-200/80 border border-slate-300 relative">
            <View className="flex-row items-center justify-between">
              <View className="bg-slate-300 px-2.5 py-0.5 rounded-full">
                <Text className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                  LOCKED
                </Text>
              </View>

              <View className="w-6 h-6 rounded-full bg-slate-300 items-center justify-center">
                <Lock size={12} color="#64748b" />
              </View>
            </View>

            <View className="self-center bg-slate-300 p-3 rounded-2xl my-1 opacity-40">
              {badge.renderIcon('#64748b')}
            </View>

            <View>
              <Text className="text-slate-700 font-extrabold text-sm leading-snug">
                {badge.title}
              </Text>
              <Text
                className="text-slate-500 text-[10px] font-medium leading-tight mt-1"
                numberOfLines={2}
              >
                {badge.description}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- Main Passport Screen ---
export default function PassportScreen() {
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<Set<string>>(
    new Set(['badge-historical', 'badge-dining'])
  );

  useEffect(() => {
    loadSavedBadges();
    registerBackgroundGeofencing();
  }, []);

  const loadSavedBadges = async () => {
    try {
      const stored = await SecureStore.getItemAsync(BADGES_STORE_KEY);
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        setUnlockedBadgeIds(new Set(parsed));
      } else {
        // Initial default unlocked badges
        const initial = ['badge-historical', 'badge-dining'];
        await SecureStore.setItemAsync(BADGES_STORE_KEY, JSON.stringify(initial));
      }
    } catch (error) {
      console.warn('SecureStore badge loading warning:', error);
    }
  };

  const handleToggleUnlock = async (badgeId: string) => {
    const nextSet = new Set(unlockedBadgeIds);
    if (nextSet.has(badgeId)) {
      nextSet.delete(badgeId);
    } else {
      nextSet.add(badgeId);
    }

    setUnlockedBadgeIds(nextSet);
    try {
      await SecureStore.setItemAsync(
        BADGES_STORE_KEY,
        JSON.stringify(Array.from(nextSet))
      );
    } catch (error) {
      console.error('Error saving badges to SecureStore:', error);
    }
  };

  const unlockedCount = unlockedBadgeIds.size;
  const totalBadges = CITY_BADGES.length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

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
                <Zap size={14} color="#00D1C4" />
                <Text className="text-xs font-extrabold text-teal-200 uppercase tracking-widest">
                  CITY BADGES & ACHIEVEMENTS
                </Text>
              </View>
              <Text className="text-2xl font-black text-white mt-0.5 tracking-tight">
                My Passport
              </Text>
            </View>

            <View className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md items-center justify-center border border-white/20">
              <Award size={24} color="#00D1C4" />
            </View>
          </View>

          {/* Progress Bar Container */}
          <View className="mt-4 bg-black/20 p-3.5 rounded-2xl border border-white/15">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-white text-xs font-bold">
                Exploration Progress
              </Text>
              <Text className="text-teal-200 text-xs font-black">
                {unlockedCount} / {totalBadges} ({progressPercent}%)
              </Text>
            </View>
            <View className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <View
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-[#00D1C4] rounded-full"
              />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Grid of City Badges */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 28,
        }}
      >
        <View className="flex-row flex-wrap justify-between">
          {CITY_BADGES.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isUnlocked={unlockedBadgeIds.has(badge.id)}
              onToggleUnlock={handleToggleUnlock}
            />
          ))}
        </View>

        {/* Tip Container */}
        <View className="mt-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-row items-center gap-3">
          <View className="p-2.5 rounded-xl bg-rose-50">
            <Sparkles size={20} color="#FF5A5F" />
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 font-extrabold text-xs">
              How to unlock badges?
            </Text>
            <Text className="text-slate-500 text-[11px] font-medium leading-relaxed mt-0.5">
              Visit landmarks in person or submit community discoveries to collect new passport badges!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
