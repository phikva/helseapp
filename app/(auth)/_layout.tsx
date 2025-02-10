import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{ headerShown: false }}
      initialRouteName="welcome"
    >
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
    </Stack>
  )
} 