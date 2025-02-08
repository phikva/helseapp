import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { supabase } from '@/lib/supabase'

export default function SignInScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn() {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      console.error(error)
      alert('Error signing in')
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
      />
      <TextInput
        className="border p-2 rounded mb-4"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity 
        className="bg-blue-500 p-4 rounded"
        onPress={signIn}
        disabled={loading}
      >
        <Text className="text-white text-center">
          {loading ? 'Loading...' : 'Sign In'}
        </Text>
      </TouchableOpacity>
    </View>
  )
} 