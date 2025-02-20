import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Modal } from 'react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  ArrowRightIcon,
  GoogleIcon
} from '@/components/Icon'

export default function SignInScreen() {
  const [email, setEmail] = useState('')
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showSMSModal, setShowSMSModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false)
  const [emailVerificationCode, setEmailVerificationCode] = useState('')

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

  async function verifyDatabaseSetup() {
    try {
      // Check if profiles table exists and we can access it
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Database setup error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error verifying database setup:', error);
      return false;
    }
  }

  async function checkProfileAndRedirect() {
    try {
      // First verify database setup
      const isDbSetup = await verifyDatabaseSetup();
      if (!isDbSetup) {
        console.error('Database not properly set up');
        router.replace('/(auth)/profile-setup');
        return;
      }

      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user.id;
      
      console.log('Checking profile for user:', userId);
      
      if (!userId) {
        console.log('No user ID found in session');
        router.replace('/(auth)/profile-setup');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId);

      console.log('Profile query result:', { data, error });

      // Handle specific Postgrest error for no rows
      if (error?.code === 'PGRST116') {
        console.log('No profile found, redirecting to setup');
        router.replace('/(auth)/profile-setup');
        return;
      }

      // Handle other errors
      if (error) {
        console.error('Database error:', error);
        router.replace('/(auth)/profile-setup');
        return;
      }

      // Check if we have any data
      if (!data || data.length === 0) {
        console.log('No profile data found, redirecting to setup');
        router.replace('/(auth)/profile-setup');
        return;
      }

      console.log('Profile found, redirecting to tabs');
      router.replace('/(tabs)');
      
    } catch (error) {
      console.error('Unexpected error checking profile:', error);
      router.replace('/(auth)/profile-setup');
    }
  }

  async function signIn() {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      // Check profile and redirect accordingly
      await checkProfileAndRedirect();
    } catch (error) {
      console.error(error)
      alert('Feil ved innlogging: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function signInWithEmail() {
    try {
      setLoading(true)
      
      console.log('Attempting email sign in with:', magicLinkEmail)
      
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(magicLinkEmail)) {
        throw new Error('Vennligst skriv inn en gyldig e-postadresse')
      }

      console.log('Email validation passed')

      const redirectUrl = __DEV__ 
        ? 'exp://10.0.0.7:8081/auth/callback'
        : 'helseapp://auth/callback'
      
      console.log('Using redirect URL:', redirectUrl)

      const { data, error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: redirectUrl,
        }
      })

      console.log('Supabase response:', { data, error })

      if (error) {
        if (error.message.includes('Email rate limit exceeded')) {
          alert('Du har bedt om for mange innloggingslinker. Vennligst vent litt og prøv igjen.')
          return
        }
        // If user doesn't exist, guide them to sign up
        if (error.message.toLowerCase().includes('user not found') || 
            error.message.toLowerCase().includes('email not found')) {
          alert('Ingen bruker funnet med denne e-postadressen. Vennligst registrer deg først.')
          router.push('/(auth)/sign-up')
          return
        }
        throw error
      }

      alert('Sjekk e-posten din for innloggingslink!')
      setShowEmailModal(false)
    } catch (error) {
      console.error('Error in signInWithEmail:', error)
      if (error instanceof Error) {
        if (error.message.includes('Email not confirmed')) {
          alert('E-posten din er ikke bekreftet. Sjekk innboksen din for en bekreftelseslink.')
        } else {
          alert('Feil ved sending av e-post: ' + error.message)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function signInWithPhone() {
    try {
      setLoading(true)
      const formattedNumber = formatPhoneNumber(phoneNumber)
      
      if (!isValidPhoneNumber(formattedNumber)) {
        throw new Error('Ugyldig telefonnummer. Bruk format: XXX XX XXX')
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedNumber,
        options: {
          channel: 'sms',
        }
      })

      if (error) {
        // Check for Twilio configuration error
        if (error.message.includes('Authentication Error - invalid username')) {
          alert('SMS-tjenesten er under vedlikehold. Vennligst bruk e-post innlogging i mellomtiden.')
          return
        }
        // If user doesn't exist, guide them to sign up
        if (error.message.toLowerCase().includes('user not found') || 
            error.message.toLowerCase().includes('phone not found')) {
          alert('Ingen bruker funnet med dette telefonnummeret. Vennligst registrer deg først.')
          router.push('/(auth)/sign-up')
          return
        }
        throw error
      }
      
      // Show verification modal instead of alert
      setShowSMSModal(false)
      setVerificationCode('')
      setShowVerificationModal(true)
    } catch (error) {
      console.error(error)
      // More user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Twilio')) {
          alert('SMS-tjenesten er midlertidig utilgjengelig. Prøv igjen senere eller bruk e-post.')
        } else if (error.message.toLowerCase().includes('user not found') || 
                  error.message.toLowerCase().includes('phone not found')) {
          alert('Ingen bruker funnet med dette telefonnummeret. Vennligst registrer deg først.')
          router.push('/(auth)/sign-up')
        } else {
          alert('Feil ved sending av SMS: ' + error.message)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Add verification function
  async function verifyPhoneNumber() {
    try {
      setLoading(true)
      const formattedNumber = formatPhoneNumber(phoneNumber)

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedNumber,
        token: verificationCode,
        type: 'sms'
      })

      if (error) {
        if (error.message.includes('Invalid token')) {
          alert('Feil kode. Vennligst prøv igjen.')
          return
        }
        throw error
      }

      // Verification successful, check profile and redirect
      setShowVerificationModal(false)
      await checkProfileAndRedirect();
    } catch (error) {
      console.error('Error in verifyPhoneNumber:', error)
      if (error instanceof Error) {
        alert('Feil ved verifisering: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Add resend code function
  async function handleResendCode() {
    try {
      setLoading(true)
      const formattedNumber = formatPhoneNumber(phoneNumber)
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedNumber,
        options: {
          channel: 'sms',
        }
      })

      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          alert('Vennligst vent litt før du prøver igjen.')
          return
        }
        throw error
      }

      alert('Ny kode er sendt!')
    } catch (error) {
      console.error('Error resending code:', error)
      if (error instanceof Error) {
        alert('Kunne ikke sende ny kode: ' + error.message)
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
            Logg inn her
          </Text>
          <Text className="text-body-large font-body text-text-secondary mt-2">
            Lorem ipsum dolor sit amet, consectetur.
          </Text>
        </View>

        {/* Email Input */}
        <View className="space-y-4">
          <View className="bg-background-secondary rounded-2xl px-4 py-[14px] flex-row items-center">
            <EnvelopeIcon size={20} color="#3C3C43" />
            <TextInput
              className="flex-1 text-body-large font-body ml-2"
              placeholder="Din e-post"
              value={email}
              onChangeText={(text) => {
                console.log('Email changed to:', text)
                setEmail(text)
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Password Login */}
          <View className="space-y-4">
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

            <TouchableOpacity 
              className="bg-primary-Black py-[18px] px-6 rounded-full flex-row items-center justify-between"
              onPress={signIn}
              disabled={loading || !email || !password}
            >
              <Text className="text-white text-body-large font-heading-medium">
                {loading ? 'Logger inn...' : 'Logg inn'}
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
              className="bg-background-secondary py-[14px] px-6 rounded-full flex-row items-center justify-between"
              onPress={() => setShowEmailModal(true)}
              disabled={loading}
            >
              <View className="flex-row items-center">
                <EnvelopeIcon size={20} color="#3C3C43" />
                <Text className="text-text text-body-large font-heading-medium ml-2">
                  Få innloggingslink på e-post
                </Text>
              </View>
              <ArrowRightIcon size={20} color="#3C3C43" />
            </TouchableOpacity>

            {/* Google Login */}
            <TouchableOpacity className="bg-background-secondary py-[14px] px-6 rounded-full flex-row items-center justify-between">
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
              className="bg-background-secondary py-[14px] px-6 rounded-full flex-row items-center justify-between"
              onPress={() => setShowSMSModal(true)}
              disabled={loading}
            >
              <View className="flex-row items-center">
                <Text className="text-text text-body-large font-heading-medium">
                  Få innloggingskode på SMS
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
                Få innloggingslink
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
                  onPress={signInWithEmail}
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
                Få innloggingskode
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
                    signInWithPhone()
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

        {/* Add Phone Verification Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showVerificationModal}
          onRequestClose={() => setShowVerificationModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-background m-5 p-6 rounded-3xl w-full max-w-sm">
              <Text className="text-display-small font-heading-medium mb-6 text-text">
                Skriv inn kode
              </Text>
              
              <Text className="text-body-large font-body text-text-secondary mb-4">
                Vi har sendt en kode til {phoneNumber}
              </Text>
              
              <View className="bg-background-secondary rounded-2xl px-4 py-[14px] flex-row items-center mb-4">
                <TextInput
                  className="flex-1 text-body-large font-body text-center"
                  placeholder="XXXX"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  className="flex-1 bg-text-secondary/10 py-[14px] rounded-full"
                  onPress={() => setShowVerificationModal(false)}
                >
                  <Text className="text-center text-text text-body-large font-heading-medium">
                    Avbryt
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  className="flex-1 bg-primary-Black py-[14px] rounded-full"
                  onPress={verifyPhoneNumber}
                  disabled={loading || !verificationCode}
                >
                  <Text className="text-center text-white text-body-large font-heading-medium">
                    {loading ? 'Verifiserer...' : 'Verifiser'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                className="mt-4"
                onPress={handleResendCode}
                disabled={loading}
              >
                <Text className="text-center text-primary-Black text-body-medium font-body">
                  Send ny kode
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Footer */}
        <View className="absolute bottom-6 left-0 right-0">
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
            <Text className="text-center text-body-medium text-text-secondary font-body">
              Ikke registrert? <Text className="text-primary-Black">Registrer deg her</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
} 