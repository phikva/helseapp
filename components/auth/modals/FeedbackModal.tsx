import { View, Text, TouchableOpacity, Modal } from 'react-native'

type FeedbackType = 'success' | 'error'

type FeedbackModalProps = {
  visible: boolean
  onClose: () => void
  title: string
  message: string
  type: FeedbackType
}

export function FeedbackModal({
  visible,
  onClose,
  title,
  message,
  type
}: FeedbackModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-background m-5 p-6 rounded-3xl w-full max-w-sm">
          <View className="items-center mb-4">
            <View className={`w-16 h-16 ${type === 'success' ? 'bg-primary-Green' : 'bg-red-500'} rounded-full items-center justify-center mb-4`}>
              <Text className="text-[32px]">
                {type === 'success' ? '✓' : '!'}
              </Text>
            </View>
            <Text className="text-display-small font-heading-serif text-text text-center">
              {title}
            </Text>
            <Text className="text-body-large font-body text-text-secondary text-center mt-2">
              {message}
            </Text>
          </View>

          <TouchableOpacity 
            className={`${type === 'success' ? 'bg-primary-Green' : 'bg-red-500'} py-[14px] rounded-full`}
            onPress={onClose}
          >
            <Text className="text-center text-text text-body-large serif">
              {type === 'success' ? 'OK, jeg forstår' : 'Prøv igjen'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
} 