import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from './IconSymbol';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  showToast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [animation] = useState(new Animated.Value(0));

  const hideToast = useCallback(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [animation]);

  const showToast = useCallback(({ message, type, title }: ToastProps) => {
    setToast({ message, type, title });
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [animation]);

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-white border-l-4 border-primary-green';
      case 'error':
        return 'bg-white border-l-4 border-red-500';
      case 'info':
        return 'bg-white border-l-4 border-blue-500';
      default:
        return 'bg-white border-l-4 border-gray-500';
    }
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'checkmark.circle.fill';
      case 'error':
        return 'xmark.circle.fill';
      case 'info':
        return 'info.circle.fill';
      default:
        return 'info.circle.fill';
    }
  };

  const getIconColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '#4A6C62'; // primary-green
      case 'error':
        return '#EF4444'; // red-500
      case 'info':
        return '#3B82F6'; // blue-500
      default:
        return '#6B7280'; // gray-500
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
              ],
              opacity: animation,
            }
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={hideToast}
            className={`${getToastStyle(toast.type)} rounded-2xl p-4 shadow-lg flex-row items-center`}
          >
            <IconSymbol name={getToastIcon(toast.type)} size={24} color={getIconColor(toast.type)} />
            <View className="flex-1 ml-3">
              {toast.title && (
                <Text className="text-primary-black font-heading-serif text-body-large mb-1">
                  {toast.title}
                </Text>
              )}
              <Text className="text-text-secondary font-body text-body-medium">
                {toast.message}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
  }
}); 