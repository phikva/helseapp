import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { layout } from '../../lib/theme'
import { Button } from '../../components/ui/Button'
import SafeArea from '@components/SafeArea'

export default function WelcomeScreen() {
  console.log('Rendering WelcomeScreen');
  
  const handleStartPress = () => {
    console.log('Navigating to sign-up');
    router.push('/(auth)/sign-up');
  };

  const handleExistingUserPress = () => {
    console.log('Navigating to sign-in');
    router.push('/(auth)/sign-in');
  };

  return (
    <SafeArea 
      edges={['top', 'bottom']} 
      backgroundColor="#fff"
    >
      <View className="flex-1 justify-center px-6 bg-light">
        {/* Content Container */}
        <View>
          {/* Header */}
          <View>
            <Text className="text-6xl font-heading-serif text-primary-green mb-4">
              Hei og{'\n'}velkommen
            </Text>
          </View>

          {/* Buttons */}
          <View className={layout.spacing.large + ' gap-y-4'}>
            <Button 
              variant="primary"
              onPress={handleStartPress}
            >
              La oss starte
            </Button>

            <Button 
              variant="secondary"
              onPress={handleExistingUserPress}
            >
              Jeg har allerede en bruker
            </Button>
          </View>
        </View>

        {/* Footer */}
        <View className="absolute bottom-6 left-0 right-0">
          <TouchableOpacity>
            <Text className="text-sm text-text-secondary opacity-60 text-center underline">
              Vilkår & betingelser
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeArea>
  );
} 