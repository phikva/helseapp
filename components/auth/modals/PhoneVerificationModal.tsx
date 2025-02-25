import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native'

type PhoneVerificationModalProps = {
  visible: boolean
  onClose: () => void
  phoneNumber: string
  verificationCode: string
  onVerificationCodeChange: (code: string) => void
  onSubmit: () => void
  onResendCode: () => void
  loading: boolean
}

export function PhoneVerificationModal({
  visible,
  onClose,
  phoneNumber,
  verificationCode,
  onVerificationCodeChange,
  onSubmit,
  onResendCode,
  loading
}: PhoneVerificationModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-background m-5 p-6 rounded-3xl w-full max-w-sm">
          <Text className="text-display-small font-heading-serif mb-6 text-text">
            Skriv inn kode
          </Text>
          
          <Text className="text-body-large font-body text-text-secondary mb-4">
            Vi har sendt en 6-sifret kode til {phoneNumber}
          </Text>
          
          <View className="bg-background-secondary rounded-2xl px-4 py-[14px] flex-row items-center mb-4">
            <TextInput
              className="flex-1 text-body-large font-body text-center tracking-[8px]"
              placeholder="000000"
              value={verificationCode}
              onChangeText={text => onVerificationCodeChange(text.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity 
              className="flex-1 bg-text-secondary/10 py-[14px] rounded-full"
              onPress={() => {
                onClose()
                onVerificationCodeChange('')
              }}
            >
              <Text className="text-center text-text text-body-large serif">
                Avbryt
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-primary-Black py-[14px] rounded-full text-text"
              onPress={onSubmit}
              disabled={loading || verificationCode.length !== 6}
            >
              <Text className="text-center text-black text-body-large font-heading-medium">
                {loading ? 'Verifiserer...' : 'Bekreft'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            className="mt-4"
            onPress={onResendCode}
            disabled={loading}
          >
            <Text className="text-center text-primary-Black text-body-medium font-body">
              Ikke mottatt kode? Send på nytt
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
} 