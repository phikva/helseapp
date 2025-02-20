import { Stack } from 'expo-router'
import { View } from 'react-native'

export default function AuthLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fff' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="index"
          options={{
            title: 'Onboarding',
          }}
        />
        <Stack.Screen 
          name="welcome"
          options={{
            title: 'Welcome',
          }}
        />
        <Stack.Screen 
          name="sign-in" 
          options={{
            title: 'Sign In',
          }} 
        />
        <Stack.Screen 
          name="sign-up" 
          options={{
            title: 'Sign Up',
          }} 
        />
        <Stack.Screen 
          name="profile-setup" 
          options={{
            title: 'Profile Setup',
            // Prevent going back
            gestureEnabled: false,
          }} 
        />
      </Stack>
    </View>
  )
} 