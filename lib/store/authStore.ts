import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AuthState {
  session: Session | null
  user: User | null
  isLoading: boolean
  hasProfile: boolean | null
  
  // Actions
  setSession: (session: Session | null) => void
  setUser: (user: User | null) => void
  setIsLoading: (isLoading: boolean) => void
  setHasProfile: (hasProfile: boolean | null) => void
  signOut: () => Promise<void>
  
  // Computed
  isAuthenticated: boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: false,
  hasProfile: null,
  
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setHasProfile: (hasProfile) => set({ hasProfile }),
  
  signOut: async () => {
    try {
      await supabase.auth.signOut()
      await AsyncStorage.removeItem('onboardingCompleted')
      set({ session: null, user: null, hasProfile: null })
      router.replace('/(auth)')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  },
  
  // Computed property
  get isAuthenticated() {
    return !!get().session?.user
  },
})) 