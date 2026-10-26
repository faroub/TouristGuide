import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Send, Bot, Sparkles, Compass } from 'lucide-react-native';
import { API_BASE_URL } from '@/services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

interface AIAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  latitude?: number;
  longitude?: number;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  visible,
  onClose,
  latitude = 48.8566,
  longitude = 2.3522,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: "Hey explorer! 🤖✨ I'm GuideBot, your witty local tour guide. Ask me about nearby history, dining, or hidden spots!",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentQuery,
          latitude,
          longitude,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botReply: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.warn('AI Assistant request failed, using energetic fallback:', error);
      const fallbackReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: "Woohoo! You're super close to Historic Old Town Square! 🏰 Grab a fresh pastry at Le Petit Bistro nearby. What else are you looking for? 🥐✨",
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-slate-950/60 justify-end"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="bg-white rounded-t-[36px] overflow-hidden shadow-2xl h-[70%]"
        >
          <TouchableOpacity activeOpacity={1} className="flex-1">
            {/* Header */}
            <LinearGradient
              colors={['#FF5A5F', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4 px-5 flex-row items-center justify-between border-b border-white/20"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center border border-white/30">
                  <Bot size={22} color="#ffffff" />
                </View>
                <View>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-white font-black text-base">
                      GuideBot AI
                    </Text>
                    <Sparkles size={14} color="#00D1C4" />
                  </View>
                  <Text className="text-rose-100 text-[11px] font-bold">
                    Witty Local Tour Guide 🤖✨
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                className="p-2 rounded-full bg-black/20 border border-white/20"
              >
                <X size={16} color="#ffffff" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Chat Messages Body */}
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 p-4 bg-[#F7F9FA]"
              contentContainerStyle={{ gap: 10, paddingBottom: 16 }}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  className={`max-w-[82%] p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-[#FF5A5F] self-end rounded-tr-none shadow-sm'
                      : 'bg-[#1E1B4B] self-start rounded-tl-none shadow-md border border-indigo-900'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold leading-relaxed ${
                      msg.sender === 'user' ? 'text-white' : 'text-slate-100'
                    }`}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))}

              {isLoading && (
                <View className="bg-[#1E1B4B] p-3 rounded-2xl self-start rounded-tl-none flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#00D1C4" />
                  <Text className="text-teal-200 text-xs font-bold">
                    GuideBot is thinking... 🤖
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Text Input Bar */}
            <View className="p-3 px-4 bg-white border-t border-slate-200/80 flex-row items-center gap-2">
              <TextInput
                className="flex-1 bg-slate-100 px-4 py-3 rounded-2xl text-slate-900 text-xs font-medium"
                placeholder="Ask GuideBot about nearby history or food..."
                placeholderTextColor="#94a3b8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className="p-3 rounded-2xl bg-[#00D1C4] items-center justify-center shadow-md shadow-[#00D1C4]/30"
              >
                <Send size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};
