import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Compass, Map, Bookmark, Award } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.DEFAULT,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <View
              className={`px-3.5 py-1.5 rounded-full items-center justify-center ${
                focused ? 'bg-[#FF5A5F] shadow-sm shadow-[#FF5A5F]' : 'bg-transparent'
              }`}
            >
              <Compass size={20} color={focused ? '#ffffff' : '#94a3b8'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }) => (
            <View
              className={`px-3.5 py-1.5 rounded-full items-center justify-center ${
                focused ? 'bg-[#FF5A5F] shadow-sm shadow-[#FF5A5F]' : 'bg-transparent'
              }`}
            >
              <Map size={20} color={focused ? '#ffffff' : '#94a3b8'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ focused }) => (
            <View
              className={`px-3.5 py-1.5 rounded-full items-center justify-center ${
                focused ? 'bg-[#FF5A5F] shadow-sm shadow-[#FF5A5F]' : 'bg-transparent'
              }`}
            >
              <Bookmark size={20} color={focused ? '#ffffff' : '#94a3b8'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="passport"
        options={{
          title: 'Passport',
          tabBarIcon: ({ focused }) => (
            <View
              className={`px-3.5 py-1.5 rounded-full items-center justify-center ${
                focused ? 'bg-[#FF5A5F] shadow-sm shadow-[#FF5A5F]' : 'bg-transparent'
              }`}
            >
              <Award size={20} color={focused ? '#ffffff' : '#94a3b8'} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
