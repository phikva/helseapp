import { Redirect } from 'expo-router'
import { useAuthStore } from '@store/authStore'

export default function Index() {
  const { session, isLoading, hasProfile } = useAuthStore()

  console.log('Root Index - Auth State:', { session, isLoading, hasProfile });

  // If loading, don't return null - instead redirect to auth flow
  if (isLoading) {
    console.log('Root Index - Loading, redirecting to auth');
    return <Redirect href="/(auth)" />;
  }

  // If logged in but no profile, go to profile setup
  if (session && !hasProfile) {
    console.log('Root Index - Redirecting to profile setup');
    return <Redirect href="/(auth)/profile-setup" />;
  }

  // If logged in and has profile, go to main app
  if (session) {
    console.log('Root Index - Redirecting to tabs');
    return <Redirect href="/(tabs)" />;
  }

  // Not logged in, show onboarding
  console.log('Root Index - Redirecting to auth/onboarding');
  return <Redirect href="/(auth)" />;
} 