import { useEffect } from 'react'
import { View, Text } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const params = useLocalSearchParams()
  
  console.log('Callback mounted, received params:', params)
  
  useEffect(() => {
    async function handleOAuthCallback() {
      try {
        console.log('Starting OAuth callback handler')
        console.log('All params:', params)
        
        if (!params.code) {
          console.error('No code found in params')
          router.replace('/sign-in')
          return
        }

        const code = String(params.code)
        console.log('Attempting to exchange code:', code)

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        console.log('Exchange response:', { data, error })

        if (error) {
          console.error('Exchange error:', error)
          throw error
        }

        console.log('Successfully exchanged code for session')
        router.replace('/(tabs)')
      } catch (error) {
        console.error('Error in callback handler:', error)
        router.replace('/sign-in')
      }
    }

    handleOAuthCallback()
  }, [params])

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-text text-body-large font-body">
        Logger deg inn...
      </Text>
    </View>
  )
} 