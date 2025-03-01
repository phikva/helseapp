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
  
  // Notify parent component of header height changes, but only when it actually changes
  useEffect(() => {
    if (onHeaderHeightChange && prevHeaderHeightRef.current !== totalHeaderHeight) {
      prevHeaderHeightRef.current = totalHeaderHeight;
      onHeaderHeightChange(totalHeaderHeight);
    }
  }, [totalHeaderHeight, onHeaderHeightChange]);

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