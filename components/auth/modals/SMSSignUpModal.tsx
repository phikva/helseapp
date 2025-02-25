import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native'

type SMSSignUpModalProps = {
  visible: boolean
  onClose: () => void
  phoneNumber: string
  onPhoneNumberChange: (number: string) => void
  onSubmit: () => void
  loading: boolean
}

export function SMSSignUpModal({
  visible,
  onClose,
  phoneNumber,
  onPhoneNumberChange,
  onSubmit,
  loading
}: SMSSignUpModalProps) {
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
            Få registreringskode
          </Text>
          
          <View className="bg-background-secondary rounded-2xl px-4 py-[14px] flex-row items-center mb-4">
            <Text className="text-text-secondary mr-2">+47</Text>
            <TextInput
              className="flex-1 text-body-large font-body"
              placeholder="XXX XX XXX"
              value={phoneNumber}
              onChangeText={onPhoneNumberChange}
              keyboardType="phone-pad"
            />
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity 
              className="flex-1 bg-background-secondary py-[14px] rounded-full"
              onPress={onClose}
            >
              <Text className="text-center text-text text-body-large serif">
                Avbryt!
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-primary-Black text-text py-[14px] rounded-full"
              onPress={onSubmit}
              disabled={loading || !phoneNumber || phoneNumber.replace(/\D/g, '').length < 8}
            >
              <Text className="text-center text-black text-body-large font-heading-medium">
                {loading ? 'Sender...' : 'Send kode'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
} 