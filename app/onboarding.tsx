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
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  gradientColors: [string, string, ...string[]];
  renderGraphic: () => React.ReactNode;
}

// Stitch Canvas Slide Sequences
const STITCH_SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-1',
    title: 'Discover the Unseen',
    subtitle:
      'Find hidden architectural gems, ancient monuments, and secret scenic spots near you with real-time location intelligence.',
    gradientColors: [Colors.secondary.DEFAULT, '#1E1B4B'], // Electric Teal -> Deep Indigo
    renderGraphic: () => (
      <View className="items-center justify-center relative">
        <View className="w-60 h-60 rounded-full bg-teal/20 items-center justify-center border-2 border-teal/30 shadow-2xl">
          <View className="w-44 h-44 rounded-full bg-teal/30 items-center justify-center border border-teal/40">
            <Compass size={84} color="#ffffff" />
          </View>
        </View>
        <View className="absolute top-2 right-4 bg-white p-3.5 rounded-2xl shadow-xl">
          <MapPin size={26} color={Colors.secondary.DEFAULT} />
        </View>
        <View className="absolute bottom-4 left-4 bg-coral p-3.5 rounded-2xl shadow-xl">
          <Sparkles size={26} color="#ffffff" />
        </View>
      </View>
    ),
  },
  {
    id: 'slide-2',
    title: 'Taste & Culture',
    subtitle:
      'Immerse yourself in award-winning local dining, authentic heritage, and vibrant city street festivals.',
    gradientColors: [Colors.themes.dining, '#881337'], // Fiery Amber -> Deep Rose
    renderGraphic: () => (
      <View className="items-center justify-center relative">
        <View className="w-60 h-60 rounded-full bg-amber/20 items-center justify-center border-2 border-amber/30 shadow-2xl">
          <View className="w-44 h-44 rounded-full bg-amber/30 items-center justify-center border border-amber/40">
            <Utensils size={76} color="#ffffff" />
          </View>
        </View>
        <View className="absolute top-2 left-4 bg-purple p-3.5 rounded-2xl shadow-xl">
          <Landmark size={26} color="#ffffff" />
        </View>
        <View className="absolute bottom-4 right-4 bg-amber p-3.5 rounded-2xl shadow-xl">
          <Sparkles size={26} color="#ffffff" />
        </View>
      </View>
    ),
  },
  {
    id: 'slide-3',
    title: 'Share Your Journey',
    subtitle:
      'Generate stunning sunset story cards, contribute community discoveries, and inspire travelers across the globe.',
    gradientColors: [Colors.primary.DEFAULT, '#581C87'], // Energetic Coral -> Deep Purple
    renderGraphic: () => (
      <View className="items-center justify-center relative">
        <View className="w-60 h-60 rounded-full bg-coral/20 items-center justify-center border-2 border-coral/30 shadow-2xl">
          <View className="w-44 h-44 rounded-full bg-coral/30 items-center justify-center border border-coral/40">
            <Share2 size={76} color="#ffffff" />
          </View>
        </View>
        <View className="absolute top-2 right-4 bg-teal p-3.5 rounded-2xl shadow-xl">
          <Send size={26} color="#ffffff" />
        </View>
        <View className="absolute bottom-4 left-4 bg-coral p-3.5 rounded-2xl shadow-xl">
          <Heart size={26} color="#ffffff" fill="#ffffff" />
        </View>
      </View>
    ),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList | null>(null);

  // Button Pulse Scale Animation
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    if (activeIndex === STITCH_SLIDES.length - 1) {
      buttonScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 900, easing: Easing.ease }),
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

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (error) {
      console.warn('AsyncStorage setItem warning:', error);
    }
    router.replace('/(tabs)');
  };

  const handleNextPress = () => {
    if (activeIndex < STITCH_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      handleFinishOnboarding();
    }
  };

  const currentSlide = STITCH_SLIDES[activeIndex];

  return (
    <View className="flex-1 bg-slate-950">
      {/* 1. Root Canvas: Vibrant Multi-Color Gradient Element */}
      <LinearGradient
        colors={currentSlide.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-full h-full absolute inset-0"
      />

      <SafeAreaView className="flex-1 justify-between py-6">
        {/* 2. Header Component: Asymmetrical Horizontal Pagination Bar */}
        <View className="px-6 flex-row items-center justify-between pt-2">
          {/* Dynamic Width Prolonged Pill Indicator */}
          <View className="flex-row items-center gap-2">
            {STITCH_SLIDES.map((slide, index) => {
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

          {/* Skip Action Target */}
          {activeIndex < STITCH_SLIDES.length - 1 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleFinishOnboarding}
              className="px-4 py-1.5 rounded-full bg-black/20 border border-white/20"
            >
              <Text className="text-white text-xs font-black uppercase tracking-wider">
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mid Section Carousel */}
        <FlatList
          ref={flatListRef}
          data={STITCH_SLIDES}
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
              {/* 3. Mid Section: Elevated Floating Vector Artwork */}
              <View className="mb-8">{item.renderGraphic()}</View>

              {/* 4. Content Block: Heavy Typography Layers */}
              <View className="items-center">
                <Text className="text-3xl font-black text-white text-center leading-tight tracking-tight">
                  {item.title}
                </Text>
                <Text
                  className="text-slate-200 text-sm text-center mt-3 leading-relaxed font-medium max-w-xs"
                  numberOfLines={2}
                >
                  {item.subtitle}
                </Text>
              </View>
            </View>
          )}
        />

        {/* 5. Primary Action Button: Fixed-Bottom Energetic Coral Button */}
        <View className="px-8 pb-4">
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleNextPress}
              className="py-4 rounded-fluid bg-coral flex-row items-center justify-center gap-2 shadow-2xl shadow-coral/50 border border-white/30"
            >
              <Text className="text-white text-base font-black tracking-wide uppercase">
                {activeIndex === STITCH_SLIDES.length - 1
                  ? "Let's Explore! ✨"
                  : 'Next'}
              </Text>
              {activeIndex < STITCH_SLIDES.length - 1 && (
                <ChevronRight size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
