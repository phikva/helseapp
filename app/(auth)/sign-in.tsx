import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'

export default function SignInScreen() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')

  async function signIn() {
    try {
      setLoading(true)
      
      // Check if identifier is an email or phone number
      const isEmail = identifier.includes('@')
      
      if (isEmail) {
        // Sign in with email and password
        const { error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        })
        if (error) throw error
      } else {
        // Sign in with phone and password
        const { error } = await supabase.auth.signInWithPassword({
          phone: identifier,
          password,
        })
        if (error) throw error
      }
    } catch (error) {
      console.error(error)
      alert('Error signing in: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function sendOTP() {
    try {
      setLoading(true)
      
      // Check if identifier is an email or phone number
      const isEmail = identifier.includes('@')
      
      const { error } = await supabase.auth.signInWithOtp({
        [isEmail ? 'email' : 'phone']: identifier,
      })
      
      if (error) throw error
      
      setOtpSent(true)
      alert(`OTP sent to your ${isEmail ? 'email' : 'phone'}!`)
    } catch (error) {
      console.error(error)
      alert('Error sending OTP: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function verifyOTP() {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.verifyOtp({
        token: otp,
        type: 'sms',
        phone: identifier,
      })
      
      if (error) throw error
    } catch (error) {
      console.error(error)
      alert('Error verifying OTP: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 justify-center p-4">
      <TextInput
        className="border p-2 rounded mb-4"
        placeholder="Email or Phone"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
      />
      {!otpSent ? (
        <>
          <TextInput
            className="border p-2 rounded mb-4"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity 
            className="bg-blue-500 p-4 rounded mb-4"
            onPress={signIn}
            disabled={loading}
          >
            <Text className="text-white text-center">
              {loading ? 'Loading...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-green-500 p-4 rounded mb-4"
            onPress={sendOTP}
            disabled={loading}
          >
            <Text className="text-white text-center">
              {loading ? 'Sending...' : 'Sign In with OTP'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            className="border p-2 rounded mb-4"
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <TouchableOpacity 
            className="bg-blue-500 p-4 rounded mb-4"
            onPress={verifyOTP}
            disabled={loading}
          >
            <Text className="text-white text-center">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity 
        onPress={() => router.push('/sign-up')}
      >
        <Text className="text-center text-blue-500">
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  )
} 