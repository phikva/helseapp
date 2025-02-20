import { View, Text, TouchableOpacity } from 'react-native'
import { EnvelopeIcon, GoogleIcon, ArrowRightIcon } from '@/components/Icon'

type AlternativeSignInMethodsProps = {
  onEmailPress: () => void
  onGooglePress: () => void
  onSMSPress: () => void
  loading: boolean
  isSignUp?: boolean
}

export function AlternativeSignInMethods({
  onEmailPress,
  onGooglePress,
  onSMSPress,
  loading,
  isSignUp = false
}: AlternativeSignInMethodsProps) {
  return (
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
          onPress={onEmailPress}
          disabled={loading}
        >
          <View className="flex-row items-center">
            <EnvelopeIcon size={20} color="#3C3C43" />
            <Text className="text-text text-body-large font-heading-medium ml-2">
              Få {isSignUp ? 'registreringslink' : 'innloggingslink'} på e-post
            </Text>
          </View>
          <ArrowRightIcon size={20} color="#3C3C43" />
        </TouchableOpacity>

        {/* Google Sign Up */}
        <TouchableOpacity 
          className="bg-background-secondary py-[14px] px-6 rounded-full flex-row items-center justify-between"
          onPress={onGooglePress}
        >
          <View className="flex-row items-center">
            <GoogleIcon size={20} color="#3C3C43" />
            <Text className="text-text text-body-large font-heading-medium ml-2">
              Fortsett med Google
            </Text>
          </View>
          <ArrowRightIcon size={20} color="#3C3C43" />
        </TouchableOpacity>

        {/* SMS Sign Up Button */}
        <TouchableOpacity 
          className="bg-background-secondary py-[14px] px-6 rounded-full flex-row items-center justify-between"
          onPress={onSMSPress}
          disabled={loading}
        >
          <View className="flex-row items-center">
            <Text className="text-text text-body-large font-heading-medium">
              Få {isSignUp ? 'registreringskode' : 'innloggingskode'} på SMS
            </Text>
          </View>
          <ArrowRightIcon size={20} color="#3C3C43" />
        </TouchableOpacity>
      </View>
    </View>
  )
} 