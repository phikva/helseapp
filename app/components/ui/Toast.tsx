import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
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
        return 'bg-primary-Green';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-800';
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

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={{
            transform: [
              {
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
            opacity: animation,
            position: 'absolute',
            bottom: 85,
            left: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={hideToast}
            className={`${getToastStyle(toast.type)} rounded-2xl p-4 shadow-lg flex-row items-center`}
          >
            <IconSymbol name={getToastIcon(toast.type)} size={24} color="white" />
            <View className="flex-1 ml-3">
              {toast.title && (
                <Text className="text-white font-heading-medium text-body-large mb-1">
                  {toast.title}
                </Text>
              )}
              <Text className="text-white font-body text-body-medium">
                {toast.message}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
} 