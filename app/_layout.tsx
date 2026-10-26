import React, { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConnectivityProvider } from '@/context/ConnectivityContext';
import '../global.css';

export default function RootLayout() {
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 60 * 5, // 5 minutes
          },
        },
      })
  );

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
      if (hasSeen !== 'true') {
        router.replace('/onboarding');
      }
    } catch (error) {
      console.warn('AsyncStorage checkOnboardingStatus error:', error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ConnectivityProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="share-preview" options={{ presentation: 'modal' }} />
            <Stack.Screen name="add-spot" options={{ presentation: 'modal' }} />
          </Stack>
        </ConnectivityProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
