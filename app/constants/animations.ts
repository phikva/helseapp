import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const SWIPE_ANIMATION = {
  THRESHOLD: width * 0.2, // 20% of screen width
  SPRING_CONFIG: {
    damping: 20,
    stiffness: 90,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },
  TIMING_CONFIG: {
    duration: 200,
  }
} as const; 