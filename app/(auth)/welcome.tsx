import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import { router } from 'expo-router'

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center px-6">
        {/* Content Container */}
        <View className="">
          {/* Header */}
          <View>
            <Text className="text-display-large font-heading-medium leading-tight text-text mb-4">

              Hei og{'\n'}velkommen
            </Text>
          </View>

          {/* Buttons */}
          <View className="space-y-3">
            <TouchableOpacity 
              className="bg-primary-Green py-[18px] rounded-full"
              onPress={() => router.push('/(auth)/sign-up')}
            >
              <Text className="text-center text-text text-body-large font-heading-medium">
                La oss starte
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-primary-Black py-[18px] rounded-full"
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text className="text-center text-text-white text-body-large font-heading-medium">
                Jeg har allerede en bruker
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="absolute bottom-6 left-0 right-0">
          <TouchableOpacity onPress={() => {/* Handle terms */}}>
            <Text className="text-center text-body-medium text-text-secondary/60 font-body underline">
              Vilkår & betingelser
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
} 