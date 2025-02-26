import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme, View } from 'react-native';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useInitAuth } from '@hooks/useInitAuth';
import { ToastProvider } from './components/ui/Toast';
import { ProfileProvider } from '../lib/store/profileStore';
import { ContentProvider } from '../lib/store/contentStore';

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
    // Montaga for serif headings
    'Montaga-Regular': require('../assets/fonts/Montaga-Regular.ttf'),
    // Roboto for body text
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
  });

  // Initialize auth state
  useInitAuth();

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

    Linking.addEventListener('url', handleDeepLink);

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
      // Clean up is handled automatically
    };
  }, [router]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ToastProvider>
            <ProfileProvider>
              <ContentProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#fff' },
                  }}
                >
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
                </Stack>
                <StatusBar style="dark" />
              </ContentProvider>
            </ProfileProvider>
          </ToastProvider>
        </ThemeProvider>
      </View>
    </GestureHandlerRootView>
  );
}
