import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import * as ExpoLocation from 'expo-location';
import {
  Search,
  MapPin,
  Navigation,
  Star,
  X,
  Compass,
  AlertCircle,
  ExternalLink,
} from 'lucide-react-native';

import {
  Location as LocationItem,
  MOCK_LOCATIONS,
  DEFAULT_CITY_COORDINATES,
} from '@/constants/locations';
import { Colors } from '@/constants/theme';

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);

  // Map & Location states
  const [userCoordinates, setUserCoordinates] = useState<ExpoLocation.LocationObjectCoordinates | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [permissionDeniedBanner, setPermissionDeniedBanner] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);

  // Selection & Search states
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalImageError, setModalImageError] = useState<boolean>(false);

  // Region state
  const [region, setRegion] = useState<Region>({
    latitude: DEFAULT_CITY_COORDINATES.latitude,
    longitude: DEFAULT_CITY_COORDINATES.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Request location permission on load
  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        setPermissionDeniedBanner(false);

        const currentLocation = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Balanced,
        });

        const { latitude, longitude } = currentLocation.coords;
        setUserCoordinates(currentLocation.coords);

        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      } else {
        setPermissionGranted(false);
        setPermissionDeniedBanner(true);
      }
    } catch (error) {
      console.warn('Location permission error:', error);
      setPermissionGranted(false);
      setPermissionDeniedBanner(true);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Filter mock locations based on search overlay
  const visibleLocations = MOCK_LOCATIONS.filter((loc) =>
    searchQuery.trim() === ''
      ? true
      : loc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Center map on search match
  const handleSearchSubmit = () => {
    if (visibleLocations.length > 0) {
      const target = visibleLocations[0];
      const targetRegion = {
        latitude: target.coordinates.latitude,
        longitude: target.coordinates.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      mapRef.current?.animateToRegion(targetRegion, 800);
      setSelectedLocation(target);
    }
  };

  // Marker Pin color helper
  const getCategoryMarkerColor = (category: string) => {
    switch (category) {
      case 'Historical':
        return Colors.markers.historical;
      case 'Cultural':
        return Colors.markers.cultural;
      case 'Dining':
        return Colors.markers.dining;
      case 'Events':
        return Colors.markers.events;
      default:
        return Colors.markers.default;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      {/* Map Container */}
      <View className="flex-1 relative">
        <MapView
          ref={mapRef}
          className="w-full h-full"
          initialRegion={region}
          showsUserLocation={permissionGranted === true}
          showsMyLocationButton={false}
        >
          {/* User Location Marker (fallback if custom user pin needed) */}
          {userCoordinates && (
            <Marker
              coordinate={{
                latitude: userCoordinates.latitude,
                longitude: userCoordinates.longitude,
              }}
              title="Your Location"
              pinColor={Colors.markers.user}
            />
          )}

          {/* Location Markers */}
          {visibleLocations.map((location) => (
            <Marker
              key={location.id}
              coordinate={{
                latitude: location.coordinates.latitude,
                longitude: location.coordinates.longitude,
              }}
              title={location.title}
              pinColor={getCategoryMarkerColor(location.category)}
              onPress={() => {
                setModalImageError(false);
                setSelectedLocation(location);
              }}
            />
          ))}
        </MapView>

        {/* Floating Top Search Bar Overlay */}
        <View className="absolute top-4 left-4 right-4 z-20">
          <View className="flex-row items-center bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-md">
            <Search size={18} color="#64748b" />
            <TextInput
              className="flex-1 ml-2.5 text-slate-800 text-sm font-medium"
              placeholder="Search map location or category..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                className="p-1 rounded-full bg-slate-100 mr-1"
                activeOpacity={0.7}
              >
                <X size={14} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>

          {/* Non-intrusive Location Permission Alert Banner */}
          {permissionDeniedBanner && (
            <View className="mt-2 bg-amber-50/95 backdrop-blur-md p-3 rounded-2xl border border-amber-200 shadow-sm flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 flex-1 pr-2">
                <AlertCircle size={18} color={Colors.accent.star} />
                <Text className="text-amber-900 text-xs font-medium flex-1">
                  Location access disabled. Showing standard city map.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPermissionDeniedBanner(false)}
                className="p-1"
              >
                <X size={14} color="#78350f" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Floating Action Button: Recenter GPS */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={requestUserLocation}
          className="absolute bottom-6 right-6 z-20 bg-white p-3.5 rounded-full shadow-lg border border-slate-100 items-center justify-center"
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color={Colors.primary.DEFAULT} />
          ) : (
            <Navigation size={22} color={Colors.primary.DEFAULT} />
          )}
        </TouchableOpacity>

        {/* Sliding Bottom Modal Overlay for Selected Location */}
        <Modal
          visible={selectedLocation !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedLocation(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedLocation(null)}
            className="flex-1 bg-slate-900/40 justify-end"
          >
            {selectedLocation && (
              <TouchableOpacity
                activeOpacity={1}
                className="bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-100"
              >
                {/* Pull Indicator Bar */}
                <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-4" />

                {/* Cover Image */}
                <View className="relative h-44 w-full bg-slate-200 rounded-2xl overflow-hidden mb-4">
                  {!modalImageError ? (
                    <Image
                      source={{ uri: selectedLocation.imageUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                      onError={() => setModalImageError(true)}
                    />
                  ) : (
                    <View className="w-full h-full bg-slate-800 items-center justify-center">
                      <Compass size={32} color="#94a3b8" />
                      <Text className="text-slate-400 text-xs mt-1">
                        Image unavailable
                      </Text>
                    </View>
                  )}

                  {/* Close Overlay Button */}
                  <TouchableOpacity
                    onPress={() => setSelectedLocation(null)}
                    className="absolute top-3 right-3 bg-slate-900/70 p-2 rounded-full"
                  >
                    <X size={16} color="#ffffff" />
                  </TouchableOpacity>

                  {/* Category Tag */}
                  <View className="absolute bottom-3 left-3 bg-slate-900/80 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">
                      {selectedLocation.category}
                    </Text>
                  </View>
                </View>

                {/* Title & Rating */}
                <View className="flex-row items-start justify-between">
                  <Text className="text-xl font-bold text-slate-900 flex-1 mr-2 leading-tight">
                    {selectedLocation.title}
                  </Text>
                  <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
                    <Star size={13} color={Colors.accent.star} fill={Colors.accent.star} />
                    <Text className="text-xs font-bold text-amber-900 ml-1">
                      {selectedLocation.rating}
                    </Text>
                  </View>
                </View>

                {/* Distance Badge */}
                <View className="flex-row items-center gap-1 mt-2">
                  <MapPin size={14} color={Colors.primary.DEFAULT} />
                  <Text className="text-xs font-medium text-slate-500">
                    {selectedLocation.distanceFormatted}
                  </Text>
                </View>

                {/* Excerpt */}
                <Text className="text-slate-600 text-xs mt-2 leading-relaxed" numberOfLines={2}>
                  {selectedLocation.excerpt}
                </Text>

                {/* View Details Action Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedLocation(null);
                    // Detail navigation handler
                  }}
                  className="mt-4 bg-blue-600 py-3.5 rounded-2xl items-center justify-center flex-row gap-2 shadow-sm"
                >
                  <Text className="text-white text-sm font-bold">View Details</Text>
                  <ExternalLink size={16} color="#ffffff" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
