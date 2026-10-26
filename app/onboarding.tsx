import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  Compass,
  MapPin,
  Sparkles,
  Utensils,
  Landmark,
  Share2,
  Heart,
  ChevronRight,
  Send,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  gradientColors: [string, string, ...string[]];
  renderGraphic: () => React.ReactNode;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-1',
    title: 'Discover the Unseen',
    subtitle:
      'Find hidden architectural gems, ancient monuments, and secret scenic spots near you with real-time location intelligence.',
    gradientColors: ['#00D1C4', '#1E1B4B'],
    renderGraphic: () => (
      <View className="items-center justify-center relative">
        <View className="w-56 h-56 rounded-full bg-teal-400/20 items-center justify-center border-2 border-teal-300/30">
          <View className="w-40 h-40 rounded-full bg-teal-400/30 items-center justify-center border border-teal-200/40">
            <Compass size={80} color="#ffffff" />
          </View>
        </View>
        <View className="absolute top-2 right-6 bg-white p-3 rounded-2xl shadow-xl">
          <MapPin size={24} color="#00D1C4" />
        </View>
        <View className="absolute bottom-4 left-6 bg-[#FF5A5F] p-3 rounded-2xl shadow-xl">
          <Sparkles size={24} color="#ffffff" />
        </View>
      </View>
    ),
  },
  {
    id: 'slide-2',
    title: 'Taste & Culture',
    subtitle:
      'Immerse yourself in award-winning local dining, authentic heritage, and vibrant city street festivals.',
    gradientColors: ['#F59E0B', '#881337'],
    renderGraphic: () => (
      <View className="items-center justify-center relative">
        <View className="w-56 h-56 rounded-full bg-amber-400/20 items-center justify-center border-2 border-amber-300/30">
          <View className="w-40 h-40 rounded-full bg-amber-400/30 items-center justify-center border border-amber-200/40">
            <Utensils size={72} color="#ffffff" />
          </View>
        </View>
        <View className="absolute top-2 left-6 bg-[#8B5CF6] p-3 rounded-2xl shadow-xl">
          <Landmark size={24} color="#ffffff" />
        </View>
        <View className="absolute bottom-4 right-6 bg-amber-400 p-3 rounded-2xl shadow-xl">
          <Sparkles size={24} color="#ffffff" />
        </View>
      </View>
    ),
  },
  {
    id: 'slide-3',
    title: 'Share Your Journey',
    subtitle:
      'Generate stunning sunset story cards, contribute community discoveries, and inspire travelers across the globe.',
    gradientColors: ['#FF5A5F', '#581C87'],
    renderGraphic: () => (
      <View className="items-center justify-center relative">
        <View className="w-56 h-56 rounded-full bg-rose-400/20 items-center justify-center border-2 border-rose-300/30">
          <View className="w-40 h-40 rounded-full bg-rose-400/30 items-center justify-center border border-rose-200/40">
            <Share2 size={72} color="#ffffff" />
          </View>
        </View>
        <View className="absolute top-2 right-6 bg-[#00D1C4] p-3 rounded-2xl shadow-xl">
          <Send size={24} color="#ffffff" />
        </View>
        <View className="absolute bottom-4 left-6 bg-[#FF5A5F] p-3 rounded-2xl shadow-xl">
          <Heart size={24} color="#ffffff" fill="#ffffff" />
        </View>
      </View>
    ),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList | null>(null);

  // Gentle Pulse Scale for Final Button
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    if (activeIndex === SLIDES.length - 1) {
      buttonScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 900, easing: Easing.ease }),
          withTiming(1, { duration: 900, easing: Easing.ease })
        ),
        -1,
        true
      );
    } else {
      buttonScale.value = withTiming(1, { duration: 200 });
    }
  }, [activeIndex]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Slide viewable items change callback
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Complete Onboarding Flow
  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (error) {
      console.warn('AsyncStorage setItem warning:', error);
    }
    router.replace('/(tabs)');
  };

  const handleNextPress = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      handleFinishOnboarding();
    }
  };

  const currentSlide = SLIDES[activeIndex];

  return (
    <View className="flex-1 bg-slate-950">
      {/* Background Gradient Animated Interpolation Container */}
      <LinearGradient
        colors={currentSlide.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-full h-full absolute inset-0"
      />

      <SafeAreaView className="flex-1 justify-between py-6">
        {/* Top Navigation & Pagination Bar */}
        <View className="px-6 flex-row items-center justify-between pt-2">
          {/* Dynamic Morphing Pagination Dots */}
          <View className="flex-row items-center gap-2">
            {SLIDES.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <View
                  key={slide.id}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isActive ? 'w-8 bg-white' : 'w-2.5 bg-white/40'
                  }`}
                />
              );
            })}
          </View>

          {/* Skip Button */}
          {activeIndex < SLIDES.length - 1 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleFinishOnboarding}
              className="px-3.5 py-1.5 rounded-full bg-black/20 border border-white/20"
            >
              <Text className="text-white text-xs font-bold uppercase tracking-wider">
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Horizontal Carousel List */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfig}
          renderItem={({ item }) => (
            <View
              style={{ width: SCREEN_WIDTH }}
              className="flex-1 justify-center items-center px-8"
            >
              {/* Slide Graphic */}
              <View className="mb-8">{item.renderGraphic()}</View>

              {/* Text Container */}
              <View className="items-center">
                <Text className="text-3xl font-black text-white text-center leading-tight tracking-tight">
                  {item.title}
                </Text>
                <Text className="text-slate-200 text-sm text-center mt-3 leading-relaxed font-medium max-w-xs">
                  {item.subtitle}
                </Text>
              </View>
            </View>
          )}
        />

        {/* Bottom Navigation Action Button */}
        <View className="px-8 pb-4">
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleNextPress}
              className={`py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-2xl ${
                activeIndex === SLIDES.length - 1
                  ? 'bg-[#FF5A5F] shadow-[#FF5A5F]/50 border border-white/30'
                  : 'bg-white shadow-black/20'
              }`}
            >
              <Text
                className={`text-base font-black tracking-wide ${
                  activeIndex === SLIDES.length - 1
                    ? 'text-white'
                    : 'text-slate-900'
                }`}
              >
                {activeIndex === SLIDES.length - 1
                  ? "Let's Explore! ✨"
                  : 'Next'}
              </Text>
              {activeIndex < SLIDES.length - 1 && (
                <ChevronRight size={20} color="#0F172A" />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
