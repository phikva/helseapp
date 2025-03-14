import { View, Text, TextInput, TouchableOpacity, Modal, Platform } from 'react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import { supabase } from '@lib/supabase'
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  ArrowRightIcon,
  GoogleIcon,
  AppleIcon,
  FacebookIcon
} from '@components/Icon'
import {
  EmailPasswordForm,
  AlternativeSignInMethods,
  EmailVerificationModal,
  PhoneVerificationModal,
  SMSSignUpModal,
  FeedbackModal
} from '@components/auth'
import SafeArea from '@components/SafeArea'

export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showSMSModal, setShowSMSModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
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
    
    // Remove leading zeros if present
    const withoutLeadingZeros = cleaned.replace(/^0+/, '')
    
    // If the number starts with 47, ensure it's not duplicated
    if (withoutLeadingZeros.startsWith('47')) {
      return withoutLeadingZeros // Return without + for Supabase
    } else {
      return '47' + withoutLeadingZeros // Return without + for Supabase
    }
  }

  // Format phone number for display
  const formatPhoneNumberForDisplay = (number: string) => {
    const formatted = formatPhoneNumber(number)
    return '+' + formatted
  }

  // Validate phone number
  const isValidPhoneNumber = (number: string) => {
    // E.164 format for Norwegian numbers: 47 followed by 8 digits (no + prefix for Supabase)
    const phoneRegex = /^47[2-9]\d{7}$/
    const isValid = phoneRegex.test(number)
    console.log('Phone validation:', { number, isValid }) // Add logging
    return isValid
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
          message: 'Vi har sendt deg en bekreftelseslink. Klikk på lenken i e-posten for å bekrefte kontoen din.',
          type: 'success'
        })
        
        // Redirect to profile setup after successful signup
        router.replace('/(auth)/profile-setup')
      }

      setShowFeedbackModal(true)
      setShowEmailModal(false)
    } catch (error) {
      console.error('Error in signUpWithEmail:', error)
      if (error instanceof Error) {
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

  async function verifyPhoneNumber() {
    try {
      setLoading(true)
      const formattedNumber = formatPhoneNumber(phoneNumber)

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedNumber, // No + prefix as per Supabase requirements
        token: verificationCode,
        type: 'sms'
      })

      if (error) {
        if (error.message.includes('Invalid token')) {
          setFeedbackMessage({
            title: 'Feil kode',
            message: 'Koden du skrev inn er ugyldig. Vennligst prøv igjen.',
            type: 'error'
          })
        } else {
          throw error
        }
        setShowFeedbackModal(true)
        return
      }

      // Verification successful
      setFeedbackMessage({
        title: 'Registrering vellykket!',
        message: 'Din konto er nå bekreftet. Du vil bli videresendt til appen.',
        type: 'success'
      })
      setShowFeedbackModal(true)
      setShowVerificationModal(false)

      // Wait a bit before redirecting to show the success message
      setTimeout(() => {
        router.replace('/(tabs)')
      }, 2000)

    } catch (error) {
      console.error('Error in verifyPhoneNumber:', error)
      setFeedbackMessage({
        title: 'Verifisering mislyktes',
        message: error instanceof Error ? error.message : 'En ukjent feil oppstod',
        type: 'error'
      })
      setShowFeedbackModal(true)
    } finally {
      setLoading(false)
    }
  }

  // Update signUpWithPhone to show verification modal after sending OTP
  async function signUpWithPhone() {
    try {
      setLoading(true)
      const formattedNumber = formatPhoneNumber(phoneNumber)
      const displayNumber = formatPhoneNumberForDisplay(phoneNumber)
      
      console.log('Attempting phone signup with:', { 
        rawNumber: phoneNumber,
        formattedNumber,
        displayNumber,
        isValid: isValidPhoneNumber(formattedNumber)
      })
      
      if (!isValidPhoneNumber(formattedNumber)) {
        throw new Error('Ugyldig telefonnummer. Bruk format: XXX XX XXX')
      }

      // First create the user with a random password
      const tempPassword = Math.random().toString(36).slice(-8)
      console.log('Creating user with phone:', { formattedNumber })
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        phone: formattedNumber,
        password: tempPassword,
      })

      console.log('Sign up response:', { signUpData, signUpError })

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          console.log('User exists, sending OTP')
          // If user exists, just send the OTP
          await sendOTP(formattedNumber)
          return
        }
        throw signUpError
      }

      // Wait 5 seconds before sending OTP for new user
      console.log('Waiting 5 seconds before sending OTP...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      await sendOTP(formattedNumber)

    } catch (error) {
      console.error('Error in signUpWithPhone:', error)
      if (error instanceof Error) {
        if (error.message.includes('Twilio')) {
          setFeedbackMessage({
            title: 'Tjeneste utilgjengelig',
            message: 'SMS-tjenesten er midlertidig utilgjengelig. Prøv igjen senere eller bruk e-post.',
            type: 'error'
          })
        } else if (error.message.includes('invalid username')) {
          setFeedbackMessage({
            title: 'Ugyldig telefonnummer',
            message: 'Telefonnummeret er ikke i riktig format eller er ikke registrert for testing. Vennligst kontakt support.',
            type: 'error'
          })
        } else if (error.message.toLowerCase().includes('security purposes') || error.message.toLowerCase().includes('rate limit')) {
          setFeedbackMessage({
            title: 'Vent litt',
            message: 'Vennligst vent noen sekunder før du prøver igjen.',
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

  // Separate function to handle OTP sending
  async function sendOTP(phoneNumber: string) {
    console.log('Sending OTP to:', phoneNumber)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
      options: { channel: 'sms' }
    })

    if (otpError) {
      console.error('OTP error:', otpError)
      throw otpError
    }

    setVerificationCode('')
    setShowVerificationModal(true)
    setShowSMSModal(false)
    setFeedbackMessage({
      title: 'Kode sendt!',
      message: 'Vi har sendt deg en verifiseringskode på SMS.',
      type: 'success'
    })
    setShowFeedbackModal(true)
  }

  // Update the resend code function in the verification modal
  async function handleResendCode() {
    try {
      setLoading(true)
      const formattedNumber = formatPhoneNumber(phoneNumber)
      await sendOTP(formattedNumber)
    } catch (error) {
      console.error('Error resending code:', error)
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('security purposes') || error.message.toLowerCase().includes('rate limit')) {
          setFeedbackMessage({
            title: 'Vent litt',
            message: 'Du må vente noen sekunder før du kan be om en ny kode.',
            type: 'error'
          })
        } else {
          setFeedbackMessage({
            title: 'Kunne ikke sende ny kode',
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
    <SafeArea edges={['top', 'bottom']} backgroundColor="#fff">
      <View className="flex-1 px-6 bg-light">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-6xl font-heading-serif leading-tight text-primary-green">
            Lag din bruker
          </Text>
          <Text className="text-body-large font-body text-text-secondary mt-2">
            Lorem ipsum dolor sit amet, consectetur.
          </Text>
        </View>

        {/* Email/Password Form */}
        <View className="space-y-4">
          <View className="bg-background-secondary rounded-full px-4 py-[22px] flex-row items-center">
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

          {/* Password Login */}
          <View className="space-y-4">
            <View className="bg-background-secondary rounded-full px-4 py-[22px] flex-row items-center">
              <LockClosedIcon size={20} color="#3C3C43" />
              <TextInput
                className="flex-1 text-body-large font-body ml-2"
                placeholder="Ditt passord"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              className="bg-black py-[22px] border border-primary-Black px-6 rounded-full flex-row items-center justify-between"
              onPress={signUp}
              disabled={loading || !email || !password}
            >
              <Text className="text-white text-body-large font-heading-medium">
                {loading ? 'Registrerer...' : 'Registrer'}
              </Text>
              <ArrowRightIcon size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Alternative Login Methods */}
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
              className="bg-background-secondary py-[22px] px-6 rounded-full flex-row items-center justify-between"
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

            {/* Google Login */}
            <TouchableOpacity className="bg-background-secondary py-[22px] px-6 rounded-full flex-row items-center justify-between">
              <View className="flex-row items-center">
                <GoogleIcon size={20} color="#3C3C43" />
                <Text className="text-text text-body-large font-heading-medium ml-2">
                  Fortsett med Google
                </Text>
              </View>
              <ArrowRightIcon size={20} color="#3C3C43" />
            </TouchableOpacity>

            {/* SMS Login Button */}
            <TouchableOpacity 
              className="bg-background-secondary py-[22px] px-6 rounded-full flex-row items-center justify-between"
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

        {/* Email Verification Modal */}
        <EmailVerificationModal
          visible={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          email={magicLinkEmail}
          onEmailChange={setMagicLinkEmail}
          onSubmit={signUpWithEmail}
          loading={loading}
        />

        {/* SMS Sign Up Modal */}
        <SMSSignUpModal
          visible={showSMSModal}
          onClose={() => setShowSMSModal(false)}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={handlePhoneNumberChange}
          onSubmit={() => {
            signUpWithPhone()
            if (!loading) setShowSMSModal(false)
          }}
          loading={loading}
        />

        {/* Phone Verification Modal */}
        <PhoneVerificationModal
          visible={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          phoneNumber={phoneNumber}
          verificationCode={verificationCode}
          onVerificationCodeChange={setVerificationCode}
          onSubmit={verifyPhoneNumber}
          onResendCode={handleResendCode}
          loading={loading}
        />

        {/* Feedback Modal */}
        <FeedbackModal
          visible={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          title={feedbackMessage.title}
          message={feedbackMessage.message}
          type={feedbackMessage.type}
        />

        {/* Footer */}
        <View className="absolute bottom-6 left-0 right-0">
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text className="text-center text-body-medium text-text-secondary font-body">
              Allerede registrert? <Text className="text-primary-Black">Logg inn her</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeArea>
  )
} 