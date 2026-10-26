import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Bot, Sparkles } from 'lucide-react-native';
import { AIAssistantModal } from './AIAssistantModal';

interface AIAssistantFABProps {
  latitude?: number;
  longitude?: number;
}

export const AIAssistantFAB: React.FC<AIAssistantFABProps> = ({
  latitude,
  longitude,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.2, { damping: 10, stiffness: 150 }, () => {
      scale.value = withSpring(1);
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <Animated.View
        style={[
          animatedStyle,
          {
            position: 'absolute',
            bottom: 24,
            right: 20,
            zIndex: 999,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handlePress}
          className="rounded-full shadow-2xl shadow-rose-900/40"
        >
          <LinearGradient
            colors={['#FF5A5F', '#00D1C4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-14 h-14 rounded-full items-center justify-center border-2 border-white shadow-lg"
          >
            <View className="relative">
              <Bot size={28} color="#ffffff" />
              <View className="absolute -top-1 -right-1 bg-amber-400 p-0.5 rounded-full border border-slate-900">
                <Sparkles size={10} color="#0F172A" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Half-screen Chat Modal Overlay */}
      <AIAssistantModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        latitude={latitude}
        longitude={longitude}
      />
    </>
  );
};
