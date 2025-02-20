import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { ArrowRightIcon } from '@/components/Icon'

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Content Container */}
        <View>
          {/* Header */}
          <View>
            <Text style={styles.headerText}>
              Hei og{'\n'}velkommen
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleStartPress}
            >
              <Text style={styles.primaryButtonText}>
                La oss starte
              </Text>
              <ArrowRightIcon size={20} color="black" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleExistingUserPress}
            >
              <Text style={styles.secondaryButtonText}>
                Jeg har allerede en bruker
              </Text>
              <ArrowRightIcon size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.footerText}>
              Vilkår & betingelser
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerText: {
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 40,
    color: '#000',
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#BCDCC4',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  secondaryButton: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'rgba(60, 60, 67, 0.6)',
    textDecorationLine: 'underline',
  },
}); 