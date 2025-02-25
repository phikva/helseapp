// This file is a fallback for using MaterialIcons on Android and web.

import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Map SF Symbols to Ionicons names
const ICON_MAPPING = {
  'house.fill': 'home-sharp',
  'paperplane.fill': 'compass-sharp',
  'person.fill': 'person-sharp',
  'chevron.left.forwardslash.chevron.right': 'code-sharp',
  'chevron.right': 'chevron-forward',
  'chevron.up': 'chevron-up',
  'chevron.down': 'chevron-down',
} as const;

export type IconSymbolName = keyof typeof ICON_MAPPING;

/**
 * An icon component that uses Ionicons for a consistent look across platforms.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return <Ionicons name={ICON_MAPPING[name]} size={size} color={color as string} style={style} />;
}
