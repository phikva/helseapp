import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext'
import * as Linking from 'expo-linking';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    // Sharp Grotesk for headings
    'SharpGrotesk-Bold20': require('../assets/fonts/SharpGrotesk-Bold20.ttf'),
    'SharpGrotesk-Medium20': require('../assets/fonts/SharpGrotesk-Medium20.ttf'),
    'SharpGrotesk-Book20': require('../assets/fonts/SharpGrotesk-Book20.ttf'),
    // Roboto for body text
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      try {
        SplashScreen.hideAsync();
      } catch (e) {
        console.log('Error hiding splash screen:', e);
      }
    }
  }, [loaded]);

  useEffect(() => {
    // Handle deep linking
    const handleDeepLink = (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      
      // Handle both development and production URLs
      if (
        event.url.includes('auth/callback') || 
        event.url.includes('auth/v1/callback') ||
        event.url.includes('szukaienojmmcefrdcjg.supabase.co')
      ) {
        console.log('Handling auth callback URL:', event.url);
        router.push({
          pathname: '/auth/callback',
          params: { url: event.url }
        });
      }
    };

    // Add event listener for deep links while app is running
    Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
        if (
          url.includes('auth/callback') || 
          url.includes('auth/v1/callback') ||
          url.includes('szukaienojmmcefrdcjg.supabase.co')
        ) {
          console.log('Handling initial auth callback URL:', url);
          router.push({
            pathname: '/auth/callback',
            params: { url }
          });
        }
      }
    });

    return () => {
      // Clean up
      // Note: The cleanup is handled automatically by the new API
    };
  }, [router]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
