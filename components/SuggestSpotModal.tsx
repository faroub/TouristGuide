import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, PlusCircle, MapPin } from 'lucide-react-native';

import { CategoryType, CATEGORIES } from '@/constants/locations';
import { Colors } from '@/constants/theme';
import { useCreatePlaceMutation } from '@/services/api';

interface SuggestSpotModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SuggestSpotModal: React.FC<SuggestSpotModalProps> = ({
  visible,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<CategoryType, 'All'>>('Historical');
  const [description, setDescription] = useState('');

  const createPlaceMutation = useCreatePlaceMutation();

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a name for the spot.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please add a brief description.');
      return;
    }

    createPlaceMutation.mutate(
      {
        title: title.trim(),
        category,
        description: description.trim(),
      },
      {
        onSuccess: () => {
          Alert.alert('Success! 🎉', 'Your suggested spot has been added and shared with the community!');
          setTitle('');
          setDescription('');
          onClose();
        },
        onError: (error) => {
          Alert.alert('Submission Error', error.message || 'Could not submit spot. Please try again.');
        },
      }
    );
  };

  const validCategories = CATEGORIES.filter((c): c is Exclude<CategoryType, 'All'> => c !== 'All');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-slate-900/50 justify-end"
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-white rounded-t-3xl p-6 shadow-2xl border-t border-slate-100 max-h-[85%]"
        >
          {/* Header Bar */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-100">
            <View className="flex-row items-center gap-2">
              <PlusCircle size={20} color={Colors.primary.DEFAULT} />
              <Text className="text-xl font-bold text-slate-900">Suggest a Spot</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1 rounded-full bg-slate-100">
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="py-4">
            {/* Title Input */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Place Name / Title *
              </Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-sm font-medium"
                placeholder="e.g. Secret Rooftop Garden"
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Category Select */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {validCategories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl border ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-white' : 'text-slate-600'
                        }`}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Description Input */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description *
              </Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-sm min-h-[100px]"
                placeholder="Describe what makes this spot special..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Submission Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={createPlaceMutation.isPending}
              className="bg-blue-600 py-4 rounded-2xl items-center justify-center flex-row gap-2 mt-2 mb-4 shadow-sm"
            >
              {createPlaceMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <MapPin size={18} color="#ffffff" />
                  <Text className="text-white font-bold text-sm">Submit Spot</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
