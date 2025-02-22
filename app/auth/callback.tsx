import { useEffect } from 'react'
import { View, Text, ActivityIndicator, Alert, Platform } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { supabase } from '@lib/supabase'
import * as Linking from 'expo-linking'

type URLParams = {
  token?: string;
  access_token?: string;
  refresh_token?: string;
  type?: string;
  expires_in?: string;
  expires_at?: string;
  confirmation_token?: string;
  code?: string;
  error?: string;
  error_code?: string;
  error_description?: string;
}

export default function AuthCallback() {
  const router = useRouter()
  const params = useLocalSearchParams()
  
  useEffect(() => {
    async function handleCallback() {
      try {
        const url = params.url as string
        
        // If no URL yet, just show loading state
        if (!url) {
          return;
        }

        console.log('Callback Screen - URL from params:', url)

        // Parse URL parameters including hash
        let urlParams: URLParams = {};
        if (url) {
          try {
            // Split the URL to get the hash part and query params
            const [urlPart, hashPart] = url.split('#')
            const queryPart = urlPart.split('?')[1]

            // Parse hash parameters if they exist
            if (hashPart) {
              const hashParams = new URLSearchParams(hashPart)
              urlParams = { ...urlParams, ...Object.fromEntries(hashParams.entries()) }
              console.log('Parsed hash params:', urlParams)
            }

            // Parse query parameters if they exist
            if (queryPart) {
              const queryParams = new URLSearchParams(queryPart)
              urlParams = { ...urlParams, ...Object.fromEntries(queryParams.entries()) }
              console.log('Parsed query params:', urlParams)
            }

            // If neither, try parsing as regular URL
            if (!hashPart && !queryPart) {
              const parsedUrl = Linking.parse(url)
              console.log('Parsed URL:', parsedUrl)
              urlParams = parsedUrl.queryParams as URLParams || {}
            }
          } catch (e) {
            console.log('Error parsing URL:', e)
          }
        }

        // Check for errors first
        if (urlParams.error) {
          console.error('Auth error:', {
            error: urlParams.error,
            code: urlParams.error_code,
            description: urlParams.error_description
          })

          let errorMessage = 'Authentication failed.'
          
          // Handle specific error cases
          if (urlParams.error_code === 'otp_expired') {
            errorMessage = 'Innloggingslinken har utløpt. Vennligst be om en ny link.'
          } else if (urlParams.error_description) {
            errorMessage = urlParams.error_description
          }

          Alert.alert(
            'Innlogging mislyktes',
            errorMessage,
            [
              {
                text: 'Prøv igjen',
                onPress: () => router.replace('/(auth)/sign-in')
              }
            ]
          )
          return
        }

        // Handle email confirmation
        if (urlParams.confirmation_token) {
          console.log('Handling email confirmation')
          const { error } = await supabase.auth.verifyOtp({
            token_hash: urlParams.confirmation_token,
            type: 'email',
          })

          if (error) {
            console.error('Error confirming email:', error)
            Alert.alert(
              'Bekreftelse mislyktes',
              'Kunne ikke bekrefte e-postadressen din. Vennligst prøv å registrere deg på nytt.',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(auth)/sign-up')
                }
              ]
            )
            return
          }

          console.log('Email confirmed successfully, sending magic link')
          
          // Get the appropriate redirect URL
          const redirectUrl = __DEV__
            ? 'helseapp://auth/callback'
            : 'https://helseapp.vercel.app/auth/callback'

          // Extract email from the JWT if possible
          let email = ''
          try {
            const jwt = urlParams.confirmation_token.split('.')[1]
            const payload = JSON.parse(atob(jwt))
            email = payload.email
          } catch (e) {
            console.error('Error extracting email from token:', e)
            Alert.alert(
              'Bekreftelse mislyktes',
              'Kunne ikke hente e-postadressen fra bekreftelsestokenet. Vennligst prøv å registrere deg på nytt.',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(auth)/sign-up')
                }
              ]
            )
            return
          }

          // Send magic link
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: redirectUrl,
            }
          })

          if (otpError) {
            console.error('Error sending magic link:', otpError)
            Alert.alert(
              'E-post bekreftet',
              'E-postadressen din er bekreftet, men vi kunne ikke sende innloggingslinken. Vennligst gå til innloggingssiden og be om en ny innloggingslink.',
              [
                {
                  text: 'Gå til innlogging',
                  onPress: () => router.replace('/(auth)/sign-in')
                }
              ]
            )
            return
          }

          Alert.alert(
            'E-post bekreftet!',
            'E-postadressen din er nå bekreftet! Vi har sendt deg en innloggingslink på e-post. Klikk på lenken i e-posten for å logge inn.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(auth)/sign-in')
              }
            ]
          )
          return
        }

        // Handle code-based authentication
        if (urlParams.code) {
          console.log('Handling code-based authentication')
          const { data, error } = await supabase.auth.exchangeCodeForSession(urlParams.code)
          
          if (error) {
            console.error('Error exchanging code for session:', error)
            
            let errorMessage = error.message
            if (error.message.includes('expired')) {
              errorMessage = 'Innloggingslinken har utløpt. Vennligst be om en ny link.'
            }
            
            Alert.alert(
              'Innlogging mislyktes',
              errorMessage,
              [
                {
                  text: 'Prøv igjen',
                  onPress: () => router.replace('/(auth)/sign-in')
                }
              ]
            )
            return
          }

          if (data.session) {
            console.log('Session established successfully:', data.session.user?.id)
            router.replace('/(tabs)')
            return
          }
        }

        // Handle magic link / session setup with tokens
        const token = urlParams.access_token
        const refreshToken = urlParams.refresh_token
        const type = urlParams.type

        console.log('Token info:', { 
          hasToken: !!token, 
          hasRefreshToken: !!refreshToken, 
          type,
          paramSource: urlParams.access_token ? 'url' : 'none'
        })

        if (!token && !urlParams.code) {
          const error = 'Ingen gyldig innloggingsinformasjon funnet i URL-en'
          console.error(error)
          Alert.alert(
            'Innlogging mislyktes',
            error,
            [
              {
                text: 'Prøv igjen',
                onPress: () => router.replace('/(auth)/sign-in')
              }
            ]
          )
          return
        }

        // Set the session if we have both tokens
        if (token && refreshToken) {
          console.log('Setting session with tokens')
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: token as string,
            refresh_token: refreshToken as string
          })

          if (error) {
            console.error('Error setting session:', error)
            Alert.alert('Session Error', error.message)
            throw error
          }
          
          if (session) {
            console.log('Session set successfully:', session.user?.id)
            router.replace('/(tabs)')
            return
          }
        }

        // Otherwise try to verify the token
        if (token) {
          console.log('Verifying OTP token')
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token as string,
            type: type === 'signup' ? 'signup' : 'magiclink'
          })

          if (error) {
            console.error('Error verifying token:', error)
            Alert.alert('Verification Error', error.message)
            throw error
          }

          console.log('Successfully verified token')
          router.replace('/(tabs)')
        }

      } catch (error) {
        console.error('Error in auth callback:', error)
        // Only show error alert if we had a URL but failed to process it
        if (params.url) {
          Alert.alert('Error', 'Authentication failed. Please try again.')
          router.replace('/(auth)/sign-in')
        }
      }
    }

    handleCallback()
  }, [params])

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" color="#00ff00" />
      <Text className="text-text text-body-large font-body mt-4">
        Verifiserer innlogging...
      </Text>
      <Text className="text-text text-body-small font-body mt-2">
        Vennligst vent mens vi verifiserer innloggingen din...
      </Text>
    </View>
  )
} 