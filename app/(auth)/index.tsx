import { SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import OnboardingScreens from './OnboardingScreens'

export default function OnboardingScreen() {
  console.log('Rendering OnboardingScreen');
  const router = useRouter()

  const handleComplete = async () => {
    console.log('OnboardingScreen - handleComplete called');
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true')
      router.push('/(auth)/welcome')
    } catch (error) {
      console.error('Error saving onboarding status:', error)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ backgroundColor: '#fff' }}>
      <StatusBar style="dark" />
      <OnboardingScreens onComplete={handleComplete} />
    </SafeAreaView>
  )
} 