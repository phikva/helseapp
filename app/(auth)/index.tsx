import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import OnboardingScreens from './OnboardingScreens'
import SafeArea from '@components/SafeArea'

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
    <SafeArea 
      edges={['top', 'bottom']} 
      backgroundColor="#fff"
    >
      <StatusBar style="dark" />
      <OnboardingScreens onComplete={handleComplete} />
    </SafeArea>
  )
} 