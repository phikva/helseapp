import { useEffect } from 'react'
import { supabase } from '@lib/supabase'
import { useAuthStore } from '@store/authStore'

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
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Check if user has profile when auth state changes
      if (session?.user) {
        checkProfile(session.user.id)
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
        return
      }

      setHasProfile(!!data)
    } catch (error) {
      console.error('Error checking profile:', error)
    }
  }
} 