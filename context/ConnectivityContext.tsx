import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';
import { WifiOff, Wifi, AlertCircle, X } from 'lucide-react-native';

interface ConnectivityContextType {
  isConnected: boolean;
  showOfflineToast: (message?: string) => void;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  isConnected: true,
  showOfflineToast: () => {},
});

export const useConnectivity = () => useContext(ConnectivityContext);

interface ConnectivityProviderProps {
  children: React.ReactNode;
}

export const ConnectivityProvider: React.FC<ConnectivityProviderProps> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [showBackOnlineBanner, setShowBackOnlineBanner] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const wasOfflineRef = useRef<boolean>(false);
  const bannerTranslateY = useRef(new Animated.Value(-120)).current;
  const toastTranslateY = useRef(new Animated.Value(120)).current;

  // Listen to NetInfo Live Network State
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? true;

      if (!connected) {
        wasOfflineRef.current = true;
        setIsConnected(false);
        setShowBackOnlineBanner(false);
      } else {
        setIsConnected(true);
        if (wasOfflineRef.current) {
          // Transitioned from Offline -> Online
          setShowBackOnlineBanner(true);
          wasOfflineRef.current = false;
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Animate Banner Slide Down / Up
  useEffect(() => {
    if (!isConnected || showBackOnlineBanner) {
      Animated.spring(bannerTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }).start();

      if (showBackOnlineBanner) {
        const timer = setTimeout(() => {
          Animated.timing(bannerTranslateY, {
            toValue: -120,
            duration: 350,
            useNativeDriver: true,
          }).start(() => {
            setShowBackOnlineBanner(false);
          });
        }, 3000);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(bannerTranslateY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, showBackOnlineBanner]);

  // Invoke Bottom Offline Toast Card
  const showOfflineToast = (message?: string) => {
    const defaultMsg = "Action queued. We'll sync when you're back online!";
    setToastMessage(message || defaultMsg);

    Animated.spring(toastTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 7,
      tension: 60,
    }).start();

    setTimeout(() => {
      Animated.timing(toastTranslateY, {
        toValue: 120,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastMessage(null));
    }, 3500);
  };

  return (
    <ConnectivityContext.Provider value={{ isConnected, showOfflineToast }}>
      <View className="flex-1 relative">
        {children}

        {/* Top Animated Offline / Back-Online Banner */}
        {(!isConnected || showBackOnlineBanner) && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              transform: [{ translateY: bannerTranslateY }],
            }}
          >
            <LinearGradient
              colors={
                showBackOnlineBanner
                  ? ['#10B981', '#059669'] // Lime / Emerald Green for Online
                  : ['#FF5A5F', '#FF8E53'] // Sunset Orange for Offline
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-5 pb-3 pt-2 shadow-xl shadow-slate-900/30 border-b border-white/20"
            >
              <SafeAreaView edges={['top']}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                    {showBackOnlineBanner ? (
                      <Wifi size={20} color="#ffffff" />
                    ) : (
                      <WifiOff size={20} color="#ffffff" />
                    )}
                    <Text className="text-white font-black text-sm tracking-wide">
                      {showBackOnlineBanner
                        ? 'Back Online! ✨'
                        : "You're exploring offline! 🗺️"}
                    </Text>
                  </View>

                  {!isConnected && (
                    <View className="bg-black/20 px-2.5 py-1 rounded-full border border-white/20">
                      <Text className="text-white text-[10px] font-black uppercase">
                        Offline Mode
                      </Text>
                    </View>
                  )}
                </View>
              </SafeAreaView>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Bottom Floating Crimson Red Toast Card */}
        {toastMessage && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 30,
              left: 20,
              right: 20,
              zIndex: 9999,
              transform: [{ translateY: toastTranslateY }],
            }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setToastMessage(null)}
              className="bg-[#1E1B4B] border-2 border-[#E11D48] rounded-2xl p-4 shadow-2xl flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View className="p-2 rounded-xl bg-[#E11D48]">
                  <AlertCircle size={18} color="#ffffff" />
                </View>
                <Text className="text-white font-extrabold text-xs flex-1 leading-snug">
                  {toastMessage}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setToastMessage(null)}
                className="p-1 rounded-full bg-white/10"
              >
                <X size={14} color="#ffffff" />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </ConnectivityContext.Provider>
  );
};
