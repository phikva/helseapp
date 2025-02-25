import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@components/Icon'

type EmailPasswordFormProps = {
  email: string
  password: string
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onSubmit: () => void
  loading: boolean
  submitText?: string
}

export function EmailPasswordForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  loading,
  submitText = 'Registrer'
}: EmailPasswordFormProps) {
  return (
    <View className="space-y-4">
      <View className="bg-background-secondary rounded-2xl px-4 py-[14px] flex-row items-center">
        <EnvelopeIcon size={20} color="#3C3C43" />
        <TextInput
          className="flex-1 text-body-large font-body ml-2"
          placeholder="Din e-post"
          value={email}
          onChangeText={onEmailChange}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
      </View>

      <View className="bg-background-secondary rounded-2xl px-4 py-[14px] flex-row items-center">
        <LockClosedIcon size={20} color="#3C3C43" />
        <TextInput
          className="flex-1 text-body-large font-body ml-2"
          placeholder="Ditt passord"
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry
        />
      </View>

      <TouchableOpacity 
        className="bg-primary-Green py-[18px] px-6 rounded-full flex-row items-center justify-between"
        onPress={onSubmit}
        disabled={loading || !email || !password}
      >
        <Text className="text-text text-body-large font-heading-serif">
          {loading ? 'Laster...' : submitText}
        </Text>
        <ArrowRightIcon size={20} color="black" />
      </TouchableOpacity>
    </View>
  )
} 