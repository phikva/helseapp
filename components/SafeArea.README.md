# SafeArea Component

A cross-platform SafeArea component that handles iOS and Android differences automatically. This component provides proper padding around the edges of the screen to account for notches, home indicators, status bars, and other system UI elements.

## Features

- **Platform-specific optimizations** for iOS and Android
- **Automatic dark/light mode support** with appropriate background colors
- **Customizable edges** to apply safe area insets selectively
- **Status bar management** on Android
- **Flexible styling** with support for custom background colors and additional styles

## Installation

No additional installation is required as this component uses dependencies already in the project:
- `react-native-safe-area-context` for safe area insets
- `nativewind` for color scheme detection

## Usage

```jsx
import React from 'react';
import { View, Text } from 'react-native';
import SafeArea from './components/SafeArea';

function MyScreen() {
  return (
    <SafeArea>
      <View>
        <Text>My content is safely padded on all sides!</Text>
      </View>
    </SafeArea>
  );
}
```

### With Custom Options

```jsx
import React from 'react';
import { View, Text } from 'react-native';
import SafeArea from './components/SafeArea';

function MyScreen() {
  return (
    <SafeArea 
      edges={['top', 'bottom']} // Only apply safe area to top and bottom
      backgroundColor="#f5f5f5"
      includeStatusBarHeight={false} // Android-specific option
      style={{ paddingHorizontal: 16 }} // Additional styles
    >
      <View>
        <Text>Custom SafeArea configuration!</Text>
      </View>
    </SafeArea>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | Required | Content to render inside the safe area |
| `style` | Object | `{}` | Additional styles to apply to the container |
| `edges` | Array<'top' \| 'right' \| 'bottom' \| 'left'> | `['top', 'right', 'bottom', 'left']` | Which edges to apply safe area padding to |
| `backgroundColor` | String | Based on color scheme | Background color of the safe area |
| `includeStatusBarHeight` | Boolean | `true` | Whether to include status bar height on Android |

## Platform-Specific Behavior

### iOS
- Handles notches and home indicators automatically
- Adapts to device orientation changes
- Respects safe area insets provided by iOS

### Android
- Manages status bar appropriately
- Sets status bar color to match background
- Provides option to include or exclude status bar height in top padding

## Example

See `SafeAreaExample.tsx` for a complete example of how to use this component. 