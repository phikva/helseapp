import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'

export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function signUp() {
    try {
      setLoading(true)
      
      // Sign up with email and password
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        phone,
        options: {
          data: {
            phone: phone // Store phone number in user metadata
          }
        }
      })

      if (signUpError) throw signUpError

      alert('Check your email for the confirmation link!')
      router.push('/sign-in')
      
    } catch (error) {
      console.error(error)
      alert('Error signing up: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 justify-center p-4">
      <TextInput
        className="border p-2 rounded mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        className="border p-2 rounded mb-4"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        className="border p-2 rounded mb-4"
        placeholder="Phone (e.g. +1234567890)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TouchableOpacity 
        className="bg-blue-500 p-4 rounded mb-4"
        onPress={signUp}
        disabled={loading}
      >
        <Text className="text-white text-center">
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => router.push('/sign-in')}
      >
        <Text className="text-center text-blue-500">
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  )
} 