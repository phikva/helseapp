import { useEffect } from 'react'
import { supabase } from '@lib/supabase'
import { useAuthStore } from '@store/authStore'
import { router } from 'expo-router'

export function useInitAuth() {
  const { setSession, setUser, setIsLoading, setHasProfile } = useAuthStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Check if user has profile
      if (session?.user) {
        checkProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', { event: _event, session })
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Check if user has profile when auth state changes
      if (session?.user) {
        const hasProfile = await checkProfile(session.user.id)
        if (!hasProfile) {
          console.log('No profile found, redirecting to profile setup')
          router.replace('/(auth)/profile-setup')
        }
      } else {
        setHasProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking profile:', error)
        setHasProfile(false)
        return false
      }

      const hasProfile = !!data
      setHasProfile(hasProfile)
      return hasProfile
    } catch (error) {
      console.error('Error checking profile:', error)
      setHasProfile(false)
      return false
    }
  }
} 