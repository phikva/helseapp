import { Stack } from 'expo-router';
import { BackButton } from '../../components/ui/BackButton';
import { colors, fonts } from '../../lib/theme';

export default function CartLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background.DEFAULT },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: fonts.heading.medium,
          fontSize: 24,
          color: colors.text.DEFAULT,
        },
        headerLeft: () => (
          <BackButton label="Tilbake" color={colors.primary.Black} />
        ),
      }}
    />
  );
} 