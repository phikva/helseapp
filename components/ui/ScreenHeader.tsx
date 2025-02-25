import React from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { BackButton } from './BackButton';
import { colors, fonts } from '../../lib/theme';

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backgroundColor?: string;
}

/**
 * A reusable screen header component that includes a title and optional back button.
 * This component is designed to be used with Stack.Screen options.
 */
export function ScreenHeader({
  title,
  showBackButton = true,
  backButtonLabel = 'Tilbake',
  backgroundColor = colors.background.DEFAULT,
}: ScreenHeaderProps) {
  return (
    <Stack.Screen
      options={{
        title,
        headerShadowVisible: false,
        headerStyle: { backgroundColor },
        headerTitleStyle: {
          fontFamily: fonts.heading.medium,
          fontSize: 20,
          color: colors.text.DEFAULT,
        },
        headerLeft: showBackButton
          ? () => <BackButton label={backButtonLabel} />
          : undefined,
      }}
    />
  );
} 