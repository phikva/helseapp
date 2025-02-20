import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native'
import { EnvelopeIcon } from '@/components/Icon'

type EmailVerificationModalProps = {
  visible: boolean
  onClose: () => void
  email: string
  onEmailChange: (email: string) => void
  onSubmit: () => void
  loading: boolean
}

export function EmailVerificationModal({
  visible,
  onClose,
  email,
  onEmailChange,
  onSubmit,
  loading
}: EmailVerificationModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-background m-5 p-6 rounded-3xl w-full max-w-sm">
          <Text className="text-display-small font-heading-medium mb-6 text-text">
            Få registreringslink
          </Text>
          
          <View className="bg-background-secondary rounded-2xl px-4 py-[14px] flex-row items-center mb-4">
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

          <View className="flex-row space-x-3">
            <TouchableOpacity 
              className="flex-1 bg-text-secondary/10 py-[14px] rounded-full"
              onPress={onClose}
            >
              <Text className="text-center text-text text-body-large font-heading-medium">
                Avbryt
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-primary-Black py-[14px] rounded-full"
              onPress={onSubmit}
              disabled={loading || !email}
            >
              <Text className="text-center text-white text-body-large font-heading-medium">
                {loading ? 'Sender...' : 'Send link'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
} 