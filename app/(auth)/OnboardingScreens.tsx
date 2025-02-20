import { View, Text, Dimensions, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useState } from 'react';

const { width } = Dimensions.get('window');

interface OnboardingItem {
  title: string;
  description: string;
  image: any;
}

const onboardingData: OnboardingItem[] = [
  {
    title: 'Oppdag nye oppskrifter',
    description: 'Få tilgang til et bredt utvalg av oppskrifter og lagre dine favoritter for enkel tilgang.',
    image: require('../../assets/images/undraw_breakfast_rgx5.png')
  },
  {
    title: 'Planlegg måltidene dine',
    description: 'Planlegg ukens og månedens måltider enkelt. Aldri mer stress med "hva skal vi spise i dag?"',
    image: require('../../assets/images/undraw_hamburger_falh.png')
  },
  {
    title: 'Tilpass og lagre',
    description: 'Lag og lagre dine egne oppskrifter, og tilpass eksisterende oppskrifter etter dine preferanser.',
    image: require('../../assets/images/undraw_online-groceries_n03y.png')
  }
];

export default function OnboardingScreens({ onComplete }: { onComplete: () => void }) {
  console.log('Rendering OnboardingScreens component');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handleNext = () => {
    console.log('Handling next, current index:', currentIndex);
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleImageError = () => {
    console.error('Failed to load image:', onboardingData[currentIndex].image);
    setImageError(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header navigation */}
        <View style={styles.header}>
          {currentIndex > 0 ? (
            <TouchableOpacity 
              onPress={handleBack}
              style={styles.headerButton}
            >
              <Text style={styles.headerText}>
                Tilbake
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}
          <TouchableOpacity 
            onPress={onComplete}
            style={styles.headerButton}
          >
            <Text style={styles.headerText}>
              Hopp over
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.mainContent}>
          {/* Image Component */}
          <View style={styles.imageContainer}>
            <Image
              source={onboardingData[currentIndex].image}
              style={styles.image}
              resizeMode="contain"
              onError={handleImageError}
            />
          </View>
          <Text style={styles.title}>
            {onboardingData[currentIndex].title}
          </Text>
          <Text style={styles.description}>
            {onboardingData[currentIndex].description}
          </Text>
        </View>

        {/* Pagination */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>

        {/* Navigation button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {currentIndex === onboardingData.length - 1 ? 'Kom i gang' : 'Neste'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 280,
    height: 280,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
    color: '#1C1C1E',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    color: '#3C3C43',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D1D6',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#BCDCC4',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  button: {
    backgroundColor: '#BCDCC4',
    padding: 18,
    borderRadius: 9999,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
}); 