import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { ArrowRightIcon } from '../../components/Icon';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  runOnJS 
} from 'react-native-reanimated';
import { SWIPE_ANIMATION } from '../../constants/animations';
import { buttonStyles, layout, colors } from '../../lib/theme';
import { client } from '../../lib/sanity';
import { getOnboardingConfig } from '../../lib/queries/onboarding';
import { SanityImageComponent } from '../../components/SanityImage';
import { Button } from '../../components/ui/Button';
import { ColorMapping } from '../../hooks/useSvgColor';

const { width } = Dimensions.get('window');

interface OnboardingScreen {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

interface OnboardingConfig {
  name: string;
  isEnabled: boolean;
  screens: OnboardingScreen[];
}

export default function OnboardingScreens({ onComplete }: { onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingConfig | null>(null);
  const [screenColors, setScreenColors] = useState<ColorMapping>({
    primary: colors.primary.green,
    text: colors.primary.green,
  });
  const translateX = useSharedValue(0);

  // Fetch onboarding data
  useEffect(() => {
    async function fetchOnboardingData() {
      try {
        const data = await client.fetch<OnboardingConfig>(getOnboardingConfig);
        if (data && data.screens) {
          const activeScreens = data.screens.filter((screen: OnboardingScreen) => screen.isActive);
          setOnboardingData({ ...data, screens: activeScreens });
        }
      } catch (error) {
        console.error('Failed to fetch onboarding data:', error);
      }
    }

    fetchOnboardingData();
  }, []);

  // Handle empty onboarding data
  useEffect(() => {
    if (onboardingData === null) return; // Still loading
    if (!onboardingData.screens.length) {
      onComplete();
    }
  }, [onboardingData, onComplete]);

  const handleNext = () => {
    if (!onboardingData?.screens) return;
    if (currentIndex < onboardingData.screens.length - 1) {
      handleSwipeComplete('left');
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      handleSwipeComplete('right');
    }
  };

  const updateIndex = (newIndex: number) => {
    setCurrentIndex(newIndex);
    setIsTransitioning(false);
  };

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    if (!onboardingData?.screens) return;
    if (isTransitioning) return;
    setIsTransitioning(true);

    const newIndex = direction === 'left' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= onboardingData.screens.length) {
      setIsTransitioning(false);
      translateX.value = withSpring(0, SWIPE_ANIMATION.SPRING_CONFIG);
      return;
    }

    const moveValue = direction === 'left' ? -width : width;
    translateX.value = withTiming(moveValue, SWIPE_ANIMATION.TIMING_CONFIG, () => {
      translateX.value = -moveValue;
      runOnJS(updateIndex)(newIndex);
      translateX.value = withSpring(0, SWIPE_ANIMATION.SPRING_CONFIG);
    });
  };

  const handleColorExtracted = (colors: ColorMapping) => {
    setScreenColors(colors);
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
      if (isTransitioning) return;
    })
    .onUpdate((event) => {
      if (!isTransitioning) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (!onboardingData?.screens) return;
      if (isTransitioning) return;

      if (Math.abs(event.translationX) > SWIPE_ANIMATION.THRESHOLD) {
        if (event.translationX > 0 && currentIndex > 0) {
          runOnJS(handleSwipeComplete)('right');
        } else if (event.translationX < 0 && currentIndex < onboardingData.screens.length - 1) {
          runOnJS(handleSwipeComplete)('left');
        } else {
          translateX.value = withSpring(0, SWIPE_ANIMATION.SPRING_CONFIG);
        }
      } else {
        translateX.value = withSpring(0, SWIPE_ANIMATION.SPRING_CONFIG);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Early return for loading or no data
  if (!onboardingData?.screens?.length) {
    return null;
  }

  const currentScreen = onboardingData.screens[currentIndex];

  // Custom button style with dynamic color
  const dynamicButtonStyle = {
    backgroundColor: screenColors.primary,
    borderRadius: 9999, // rounded-full
    paddingVertical: 18,
    paddingHorizontal: 24,
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header navigation */}
        <View className={`flex-row justify-between items-center ${layout.padding.default} pt-5`}>
          {currentIndex > 0 ? (
            <TouchableOpacity 
              onPress={handleBack}
              className={buttonStyles.transparent.base}
              disabled={isTransitioning}
            >
              <Text className={buttonStyles.transparent.text} style={{ color: screenColors.text }}>
                Tilbake
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="w-[80px]" />
          )}
          <TouchableOpacity 
            onPress={onComplete}
            className={buttonStyles.transparent.base}
            disabled={isTransitioning}
          >
            <Text className={buttonStyles.transparent.text} style={{ color: screenColors.text }}>
              Hopp over
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <GestureDetector gesture={gesture}>
          <Animated.View className={`flex-1 items-center justify-center ${layout.padding.default}`} style={animatedStyle}>
            {/* Image Component */}
            <View className="w-[300px] h-[300px] justify-center items-center">
              <SanityImageComponent
                source={currentScreen.imageUrl}
                width={280}
                height={280}
                onColorExtracted={handleColorExtracted}
              />
            </View>
            <Text 
              className="text-5xl font-heading-serif text-center mt-8 mb-4" 
              style={{ color: screenColors.text }}
            >
              {currentScreen.title}
            </Text>
            <Text className="text-lg body-regular text-center px-8 text-text-secondary">
              {currentScreen.description}
            </Text>
          </Animated.View>
        </GestureDetector>

        {/* Pagination */}
        <View className={`flex-row justify-center items-center ${layout.spacing.default} mb-8`}>
          {onboardingData.screens.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => !isTransitioning && setCurrentIndex(index)}
              disabled={isTransitioning}
              className="p-[2px]"
            >
              <View
                style={{
                  height: 8,
                  borderRadius: 4,
                  width: index === currentIndex ? 24 : 8,
                  backgroundColor: index === currentIndex ? screenColors.primary : '#D1D1D6'
                }}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation button */}
        <View className={`${layout.padding.default} pb-12`}>
          <Button 
            variant="primary"
            onPress={handleNext}
            disabled={isTransitioning}
            style={dynamicButtonStyle}
            textColor="white"
          >
            {currentIndex === onboardingData.screens.length - 1 ? 'Kom i gang' : 'Neste'}
          </Button>
        </View>
      </View>
    </View>
  );
} 