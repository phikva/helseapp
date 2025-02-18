import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'

type AuthContextType = {
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    router.replace('/(auth)/sign-in')
  }

  const validateAndSetSession = async (newSession: Session | null) => {
    if (newSession) {
      try {
        // Try to get the user profile to verify the session is valid
        const { data: { user }, error } = await supabase.auth.getUser(newSession.access_token)
        
        if (error || !user) {
          console.log('Session invalid or user deleted:', error?.message)
          await signOut()
          return
        }

        setSession(newSession)
      } catch (error) {
        console.error('Error validating session:', error)
        await signOut()
      }
    } else {
      setSession(null)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      validateAndSetSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await validateAndSetSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 