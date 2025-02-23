import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface ShimmerProps {
  style?: ViewStyle;
  duration?: number;
  className?: string;
}

const Shimmer: React.FC<ShimmerProps> = ({ 
  style, 
  duration = 1000,
  className = "" 
}) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, [duration]);

  const animatedStyle = {
    opacity: shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
    ...style,
  };

  return (
    <Animated.View 
      style={animatedStyle}
      className={`bg-gray-200 ${className}`}
    />
  );
};

export default Shimmer; 