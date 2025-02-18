import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Modal, Platform } from 'react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  ArrowRightIcon,
  GoogleIcon,
  AppleIcon,
  FacebookIcon
} from '@/components/Icon'

export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showSMSModal, setShowSMSModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState({ 
    title: '', 
    message: '', 
    type: 'success' as 'success' | 'error' 
  })

  // Format phone number to E.164 format
  const formatPhoneNumber = (number: string) => {
    // Remove all non-digit characters
    const cleaned = number.replace(/\D/g, '')
    
    // Add Norwegian country code if not present
    if (cleaned.startsWith('47')) {
      return '+' + cleaned
    } else {
      return '+47' + cleaned
    }
  }

  // Validate phone number
  const isValidPhoneNumber = (number: string) => {
    const phoneRegex = /^\+47[2-9]\d{7}$/
    return phoneRegex.test(number)
  }

  async function signUp() {
    try {
      setLoading(true)
      
      // Get the appropriate redirect URL
      const redirectUrl = __DEV__
        ? 'helseapp://auth/callback'
        : 'https://helseapp.vercel.app/auth/callback'

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            // Add any additional user metadata here
          }
        }
      })
      
      if (error) throw error

      console.log('Sign up response:', { data, error })

      if (data?.user?.confirmation_sent_at) {
        setFeedbackMessage({
          title: 'Sjekk e-posten din!',
          message: 'Vi har sendt deg en e-post med en bekreftelseslink. Klikk på lenken i e-posten for å bekrefte kontoen din. Dette kan ta noen minutter.',
          type: 'success'
        })
      } else {
        setFeedbackMessage({
          title: 'Noe gikk galt',
          message: 'Vi kunne ikke sende bekreftelsesmail. Vennligst prøv igjen eller kontakt support.',
          type: 'error'
        })
      }
      setShowFeedbackModal(true)
    } catch (error) {
      console.error('Sign up error:', error)
      let errorMessage = (error as Error).message
      
      // Handle specific error cases
      if (errorMessage.includes('User already registered')) {
        errorMessage = 'Denne e-postadressen er allerede registrert. Vennligst logg inn i stedet.'
      }
      
      setFeedbackMessage({
        title: 'Registrering mislyktes',
        message: errorMessage,
        type: 'error'
      })
      setShowFeedbackModal(true)
    } finally {
      setLoading(false)
    }
  }

  async function signUpWithEmail() {
    try {
      setLoading(true)
      
      console.log('Attempting email sign up with:', magicLinkEmail)
      
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(magicLinkEmail)) {
        throw new Error('Vennligst skriv inn en gyldig e-postadresse')
      }

      console.log('Email validation passed')

      // Get the appropriate redirect URL based on environment
      const redirectUrl = Platform.select({
        ios: 'helseapp://auth/callback',
        android: 'helseapp://auth/callback',
        default: 'helseapp://auth/callback'
      })
      
      console.log('Using redirect URL:', redirectUrl)

      // First create the user with a random password
      const tempPassword = Math.random().toString(36).slice(-8)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: magicLinkEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            tempPassword,
          }
        }
      })

      console.log('Sign up response:', { signUpData, signUpError })

      // If user already exists, send magic link instead
      if (signUpError?.message.includes('User already registered')) {
        console.log('User exists, sending magic link')
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: magicLinkEmail,
          options: {
            emailRedirectTo: redirectUrl,
          }
        })

        if (otpError) {
          if (otpError.message.toLowerCase().includes('rate limit')) {
            setFeedbackMessage({
              title: 'Vent litt',
              message: 'Du må vente 60 sekunder før du kan be om en ny e-post. Dette er for å forhindre spam.',
              type: 'error'
            })
            setShowFeedbackModal(true)
            return
          }
          throw otpError
        }

        setFeedbackMessage({
          title: 'Sjekk e-posten din!',
          message: 'Vi har sendt deg en innloggingslink. Klikk på lenken i e-posten for å logge inn.',
          type: 'success'
        })
      } else if (signUpError) {
        if (signUpError.message.toLowerCase().includes('rate limit')) {
          setFeedbackMessage({
            title: 'Vent litt',
            message: 'Du må vente 60 sekunder før du kan be om en ny e-post. Dette er for å forhindre spam.',
            type: 'error'
          })
          setShowFeedbackModal(true)
          return
        }
        // Handle other sign-up errors
        throw signUpError
      } else {
        // New user created successfully
        setFeedbackMessage({
          title: 'Sjekk e-posten din!',
          message: 'Vi har sendt deg en bekreftelseslink. Klikk på lenken i e-posten for å bekrefte kontoen din, deretter kan du logge inn.',
          type: 'success'
        })
      }

      setShowFeedbackModal(true)
      setShowEmailModal(false)
    } catch (error) {
      console.error('Error in signUpWithEmail:', error)
      if (error instanceof Error) {
        // Check if it's a rate limit error
        if (error.message.toLowerCase().includes('rate limit')) {
          setFeedbackMessage({
            title: 'Vent litt',
            message: 'Du må vente 60 sekunder før du kan be om en ny e-post. Dette er for å forhindre spam.',
            type: 'error'
          })
        } else {
          setFeedbackMessage({
            title: 'Noe gikk galt',
            message: error.message,
            type: 'error'
          })
        }
        setShowFeedbackModal(true)
      }
    } finally {
      setLoading(false)
    }
  }

  async function signUpWithPhone() {
    try {
      setLoading(true)
      const formattedNumber = formatPhoneNumber(phoneNumber)
      
      if (!isValidPhoneNumber(formattedNumber)) {
        throw new Error('Ugyldig telefonnummer. Bruk format: XXX XX XXX')
      }

      // First create the user with a random password
      const tempPassword = Math.random().toString(36).slice(-8)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        phone: formattedNumber,
        password: tempPassword,
      })

      console.log('Sign up response:', { signUpData, signUpError })

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setFeedbackMessage({
            title: 'Bruker eksisterer',
            message: 'En bruker med dette telefonnummeret eksisterer allerede. Vennligst logg inn i stedet.',
            type: 'error'
          })
          setShowFeedbackModal(true)
          return
        }
        throw signUpError
      }

      // If user is created and confirmed immediately (happens in development)
      if (signUpData?.user?.confirmed_at) {
        console.log('User confirmed immediately, redirecting...')
        router.replace('/(tabs)')
        return
      }

      // Then send the OTP for phone verification
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formattedNumber,
        options: {
          channel: 'sms',
        }
      })

      if (otpError) {
        if (otpError.message.includes('Authentication Error - invalid username')) {
          setFeedbackMessage({
            title: 'Tjeneste utilgjengelig',
            message: 'SMS-tjenesten er under vedlikehold. Vennligst bruk e-post registrering i mellomtiden.',
            type: 'error'
          })
          setShowFeedbackModal(true)
          return
        }
        throw otpError
      }
      
      setFeedbackMessage({
        title: 'Sjekk telefonen din!',
        message: 'Vi har sendt deg en registreringskode på SMS. Skriv inn koden for å fullføre registreringen.',
        type: 'success'
      })
      setShowFeedbackModal(true)
      setShowSMSModal(false)
    } catch (error) {
      console.error('Error in signUpWithPhone:', error)
      if (error instanceof Error) {
        if (error.message.includes('Twilio')) {
          setFeedbackMessage({
            title: 'Tjeneste utilgjengelig',
            message: 'SMS-tjenesten er midlertidig utilgjengelig. Prøv igjen senere eller bruk e-post.',
            type: 'error'
          })
        } else {
          setFeedbackMessage({
            title: 'Registrering mislyktes',
            message: error.message,
            type: 'error'
          })
        }
        setShowFeedbackModal(true)
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle phone number input formatting
  const handlePhoneNumberChange = (text: string) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, '')
    
    // Format as XXX XX XXX
    let formatted = cleaned
    if (cleaned.length > 3) {
      formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3)
    }
    if (cleaned.length > 5) {
      formatted = formatted.slice(0, 6) + ' ' + formatted.slice(6)
    }
    
    // Limit to 8 digits
    if (cleaned.length <= 8) {
      setPhoneNumber(formatted)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background pt-24">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-display-large font-heading-medium leading-tight text-text">
            Lag din bruker
          </Text>
          <Text className="text-body-large font-body text-text-secondary mt-2">
            Lorem ipsum dolor sit amet, consectetur.
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View className="bg-background-secondary rounded-2xl px-4 py-[14px] flex-row items-center">
            <EnvelopeIcon size={20} color="#3C3C43" />
            <TextInput
              className="flex-1 text-body-large font-body ml-2"
              placeholder="Din e-post"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View className="bg-background-secondary rounded-2xl px-4 py-[14px] flex-row items-center">
            <LockClosedIcon size={20} color="#3C3C43" />
            <TextInput
              className="flex-1 text-body-large font-body ml-2"
              placeholder="Ditt passord"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            className="bg-primary-Green py-[18px] px-6 rounded-full flex-row items-center justify-between"
            onPress={signUp}
            disabled={loading || !email || !password}
          >
            <Text className="text-text text-body-large font-heading-medium">
              {loading ? 'Registrerer...' : 'Registrer'}
            </Text>
            <ArrowRightIcon size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Alternative Sign Up Methods */}
        <View className="mt-8">
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-text-secondary/10" />
            <Text className="mx-4 text-body-medium font-body text-text-secondary">
              Eller
            </Text>
            <View className="flex-1 h-[1px] bg-text-secondary/10" />
          </View>

          <View className="space-y-3">
            {/* Email Magic Link */}
            <TouchableOpacity 
              className="bg-background-secondary py-[14px] px-6 rounded-full flex-row items-center justify-between"
              onPress={() => setShowEmailModal(true)}
              disabled={loading}
            >
              <View className="flex-row items-center">
                <EnvelopeIcon size={20} color="#3C3C43" />
                <Text className="text-text text-body-large font-heading-medium ml-2">
                  Få registreringslink på e-post
                </Text>
              </View>
              <ArrowRightIcon size={20} color="#3C3C43" />
            </TouchableOpacity>

            {/* Google Sign Up */}
            <TouchableOpacity className="bg-background-secondary py-[14px] px-6 rounded-full flex-row items-center justify-between">
              <View className="flex-row items-center">
                <GoogleIcon size={20} color="#3C3C43" />
                <Text className="text-text text-body-large font-heading-medium ml-2">
                  Fortsett med Google
                </Text>
              </View>
              <ArrowRightIcon size={20} color="#3C3C43" />
            </TouchableOpacity>

            {/* SMS Sign Up Button */}
            <TouchableOpacity 
              className="bg-background-secondary py-[14px] px-6 rounded-full flex-row items-center justify-between"
              onPress={() => setShowSMSModal(true)}
              disabled={loading}
            >
              <View className="flex-row items-center">
                <Text className="text-text text-body-large font-heading-medium">
                  Få registreringskode på SMS
                </Text>
              </View>
              <ArrowRightIcon size={20} color="#3C3C43" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Email Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showEmailModal}
          onRequestClose={() => setShowEmailModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-background m-5 p-6 rounded-3xl w-full max-w-sm">
              <Text className="text-display-small font-heading-medium mb-6 text-text">
                Få registreringslink
              </Text>
              
              <View className="bg-background-secondary rounded-2xl px-4 py-[14px] flex-row items-center mb-4">
                <EnvelopeIcon size={20} color="#3C3C43" />
                <TextInput
                  className="flex-1 text-body-large font-body ml-2"
                  placeholder="Din e-post"
                  value={magicLinkEmail}
                  onChangeText={setMagicLinkEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>

              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  className="flex-1 bg-text-secondary/10 py-[14px] rounded-full"
                  onPress={() => setShowEmailModal(false)}
                >
                  <Text className="text-center text-text text-body-large font-heading-medium">
                    Avbryt
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  className="flex-1 bg-primary-Black py-[14px] rounded-full"
                  onPress={signUpWithEmail}
                  disabled={loading || !magicLinkEmail}
                >
                  <Text className="text-center text-white text-body-large font-heading-medium">
                    {loading ? 'Sender...' : 'Send link'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* SMS Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showSMSModal}
          onRequestClose={() => setShowSMSModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-background m-5 p-6 rounded-3xl w-full max-w-sm">
              <Text className="text-display-small font-heading-medium mb-6 text-text">
                Få registreringskode
              </Text>
              
              <View className="bg-background-secondary rounded-2xl px-4 py-[14px] flex-row items-center mb-4">
                <Text className="text-text-secondary mr-2">+47</Text>
                <TextInput
                  className="flex-1 text-body-large font-body"
                  placeholder="XXX XX XXX"
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  keyboardType="phone-pad"
                />
              </View>

              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  className="flex-1 bg-text-secondary/10 py-[14px] rounded-full"
                  onPress={() => setShowSMSModal(false)}
                >
                  <Text className="text-center text-text text-body-large font-heading-medium">
                    Avbryt
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  className="flex-1 bg-primary-Black py-[14px] rounded-full"
                  onPress={() => {
                    signUpWithPhone()
                    if (!loading) setShowSMSModal(false)
                  }}
                  disabled={loading || !phoneNumber || phoneNumber.replace(/\D/g, '').length < 8}
                >
                  <Text className="text-center text-white text-body-large font-heading-medium">
                    {loading ? 'Sender...' : 'Send kode'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Feedback Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showFeedbackModal}
          onRequestClose={() => setShowFeedbackModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-background m-5 p-6 rounded-3xl w-full max-w-sm">
              <View className="items-center mb-4">
                <View className={`w-16 h-16 ${feedbackMessage.type === 'success' ? 'bg-primary-Green' : 'bg-red-500'} rounded-full items-center justify-center mb-4`}>
                  <Text className="text-[32px]">
                    {feedbackMessage.type === 'success' ? '✓' : '!'}
                  </Text>
                </View>
                <Text className="text-display-small font-heading-medium text-text text-center">
                  {feedbackMessage.title}
                </Text>
                <Text className="text-body-large font-body text-text-secondary text-center mt-2">
                  {feedbackMessage.message}
                </Text>
              </View>

              <TouchableOpacity 
                className={`${feedbackMessage.type === 'success' ? 'bg-primary-Green' : 'bg-red-500'} py-[14px] rounded-full`}
                onPress={() => setShowFeedbackModal(false)}
              >
                <Text className="text-center text-text text-body-large font-heading-medium">
                  {feedbackMessage.type === 'success' ? 'OK, jeg forstår' : 'Prøv igjen'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Footer */}
        <View className="absolute bottom-6 left-0 right-0">
          <TouchableOpacity onPress={() => {/* Handle terms */}}>
            <Text className="text-center text-body-medium text-text-secondary/60 font-body underline">
              Vilkår & betingelser
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
} 