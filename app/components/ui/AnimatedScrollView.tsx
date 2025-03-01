import React, { useEffect, useRef } from 'react';
import { Animated, ScrollViewProps, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AnimatedScrollViewProps extends ScrollViewProps {
  scrollY: Animated.Value;
  headerHeight?: number;
  children: React.ReactNode;
  onHeaderHeightChange?: (height: number) => void;
}

export default function AnimatedScrollView({
  scrollY,
  headerHeight = 100, // Default base header height
  children,
  onHeaderHeightChange,
  ...props
}: AnimatedScrollViewProps) {
  const insets = useSafeAreaInsets();
  const totalHeaderHeight = headerHeight + insets.top;
  const prevHeaderHeightRef = useRef(totalHeaderHeight);
  const scrollViewRef = useRef<any>(null);
  
  // Notify parent component of header height changes, but only when it actually changes
  useEffect(() => {
    if (onHeaderHeightChange && prevHeaderHeightRef.current !== totalHeaderHeight) {
      prevHeaderHeightRef.current = totalHeaderHeight;
      onHeaderHeightChange(totalHeaderHeight);
    }
  }, [totalHeaderHeight, onHeaderHeightChange]);

  // Ensure the header is visible on initial render
  useEffect(() => {
    // Set initial scroll position to 0 to ensure header is visible
    scrollY.setValue(0);
  }, []);

  // Memoize the scroll event handler to prevent recreating it on every render
  const scrollHandler = React.useMemo(() => 
    Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: true }
    ), 
    [scrollY]
  );

  return (
    <Animated.ScrollView
      ref={scrollViewRef}
      scrollEventThrottle={1} // More responsive scroll events for better header behavior
      onScroll={scrollHandler}
      contentContainerStyle={{
        paddingTop: totalHeaderHeight,
        paddingBottom: insets.bottom + 20,
      }}
      {...props}
    >
      {children}
    </Animated.ScrollView>
  );
} 