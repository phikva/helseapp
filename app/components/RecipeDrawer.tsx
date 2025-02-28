import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Dimensions, 
  StyleSheet,
  PanResponder,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { client } from '@/lib/sanity';
import { getRecipeByIdQuery } from '@/lib/queries/recipeQueries';
import RecipeSkeleton from './skeleton/RecipeSkeleton';
import { colors } from '../../lib/theme';
import { getRecipeImageSource } from '../../lib/imageUtils';
import { useAuthStore } from '../../lib/store/authStore';
import { useSavedRecipesStore } from '../../lib/store/savedRecipesStore';
import { saveRecipe, removeRecipe } from '../../lib/services/savedRecipesService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.9;

interface Recipe {
  _id: string;
  tittel: string;
  image: string;
  kategorier: Array<{
    _id: string;
    name: string;
  }>;
  ingrediens: Array<{
    name: string;
    measurement?: {
      unit: string;
      unitQuantity: number;
    };
    mengde?: string;
    kcal: number;
    makros: {
      protein: number;
      karbs: number;
      fett: number;
    };
    kommentar?: string;
  }>;
  instruksjoner: string[];
  notater?: string;
  totalKcal: number;
  totalMakros: {
    protein: number;
    karbs: number;
    fett: number;
  };
}

interface RecipeDrawerProps {
  recipeId: string;
  colorName?: string;
  visible: boolean;
  onClose: () => void;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export default function RecipeDrawer({ 
  recipeId, 
  colorName = 'green', 
  visible, 
  onClose,
  onAddToMealPlan
}: RecipeDrawerProps) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const { session } = useAuthStore();
  const { savedRecipes, refreshSavedRecipes, refreshFavoriteRecipes } = useSavedRecipesStore();
  
  // Animation values
  const translateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current;
  
  // Get the color based on the color parameter
  const accentColor = colors.primary[colorName as keyof typeof colors.primary] || colors.primary.green;
  
  // Configure pan responder for swipe-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) { // Only allow downward swipes
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAWER_HEIGHT * 0.2 || gestureState.vy > 0.5) {
          // If drawer is pulled down more than 20% or with high velocity, close it
          closeDrawer();
        } else {
          // Otherwise, snap back to open position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      fetchRecipe();
      openDrawer();
    }
  }, [visible, recipeId]);

  const fetchRecipe = async () => {
    if (!recipeId) return;
    
    setLoading(true);
    try {
      const data = await client.fetch(getRecipeByIdQuery, { id: recipeId });
      setRecipe(data);
      setLoading(false);
    } catch (err) {
      setError('Kunne ikke laste inn oppskriften');
      setLoading(false);
      console.error('Error fetching recipe:', err);
    }
  };

  const openDrawer = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(translateY, {
      toValue: DRAWER_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  // Check if a recipe is saved as favorite
  const isRecipeFavorite = (recipeId: string) => {
    const savedRecipe = savedRecipes.find(sr => sr.recipe_id === recipeId);
    return savedRecipe?.is_favorite || false;
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!recipe) return;
    
    if (!session?.user) {
      Alert.alert(
        'Logg inn',
        'Du må være logget inn for å lagre oppskrifter',
        [
          { text: 'Avbryt', style: 'cancel' },
          { text: 'Logg inn', onPress: () => router.push('/(auth)/sign-in') }
        ]
      );
      return;
    }
    
    setSavingRecipe(true);
    
    // Check current favorite status
    const currentlyFavorite = isRecipeFavorite(recipe._id);
    
    try {
      // Toggle the favorite status (true to add, false to remove)
      if (currentlyFavorite) {
        await removeRecipe(session.user.id, recipe._id);
      } else {
        await saveRecipe(session.user.id, recipe._id, true);
      }
      
      // Refresh both lists to ensure consistency across the app
      refreshSavedRecipes();
      refreshFavoriteRecipes();
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      
      // Handle specific error messages
      let errorMessage = 'Det oppstod en feil ved lagring av oppskriften';
      
      if (error.message) {
        if (error.message.includes('session has expired') || 
            error.message.includes('No active session') ||
            error.message.includes('User ID mismatch')) {
          errorMessage = error.message;
          // Redirect to login if session issues
          Alert.alert(
            'Sesjonsfeil',
            errorMessage,
            [
              { text: 'Avbryt', style: 'cancel' },
              { text: 'Logg inn', onPress: () => router.push('/(auth)/sign-in') }
            ]
          );
          return;
        } else if (error.code === '42501') {
          errorMessage = 'Du har ikke tillatelse til å lagre denne oppskriften. Vennligst logg inn på nytt.';
        }
      }
      
      Alert.alert('Feil', errorMessage);
    } finally {
      setSavingRecipe(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <RecipeSkeleton />;
    }

    if (error || !recipe) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center">{error || 'Fant ikke oppskriften'}</Text>
          <TouchableOpacity 
            onPress={closeDrawer}
            className="mt-4 bg-primary-green px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Lukk</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const isFavorite = isRecipeFavorite(recipe._id);

    return (
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="relative">
          <Image
            source={getRecipeImageSource(recipe.image, 400, 250, recipe._id)}
            className="w-full h-56"
            resizeMode="cover"
          />
          
          {/* Floating header with close and favorite buttons */}
          <View className="absolute top-0 left-0 right-0 flex-row justify-between items-center p-4">
            <TouchableOpacity 
              onPress={closeDrawer}
              className="bg-white/80 rounded-full p-2"
            >
              <Ionicons name="close" size={24} color={accentColor} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={toggleFavorite}
              disabled={savingRecipe}
              className="bg-white/80 rounded-full p-2"
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#FF6B6B" : accentColor} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="p-4">
          <Text style={{ color: accentColor }} className="text-4xl font-heading-serif mb-4">{recipe.tittel}</Text>
          
          {/* Categories */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {recipe.kategorier.map((kategori) => (
              <TouchableOpacity
                key={kategori._id}
                onPress={() => {
                  // Close the drawer first
                  closeDrawer();
                  
                  // Navigate to recipes tab with category filter
                  router.push({
                    pathname: '/(tabs)/recipes',
                    params: { 
                      filterCategory: kategori._id,
                      categoryName: kategori.name
                    }
                  });
                }}
                style={{ backgroundColor: `${accentColor}20` }}
                className="px-3 py-1 rounded-full"
              >
                <Text style={{ color: accentColor }}>{kategori.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nutritional Info */}
          <View className="bg-white p-4 rounded-2xl mb-6 shadow-sm">
            <Text style={{ color: accentColor }} className="text-xl font-heading-serif mb-2">Næringsinnhold</Text>
            <Text className="text-text-secondary mb-2">Totalt kalorier: {recipe.totalKcal} kcal</Text>
            <View className="flex-row justify-between">
              <Text className="text-text-secondary">Protein: {recipe.totalMakros.protein}g</Text>
              <Text className="text-text-secondary">Karbohydrater: {recipe.totalMakros.karbs}g</Text>
              <Text className="text-text-secondary">Fett: {recipe.totalMakros.fett}g</Text>
            </View>
          </View>

          {/* Ingredients */}
          <View className="mb-6">
            <Text style={{ color: accentColor }} className="text-xl font-heading-serif mb-3">Ingredienser</Text>
            <View className="bg-white rounded-2xl shadow-sm p-4">
              {recipe.ingrediens.map((ingredient, index) => (
                <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <View>
                    <Text className="text-lg">{ingredient.name}</Text>
                    {ingredient.kommentar && (
                      <Text className="text-text-secondary text-sm">{ingredient.kommentar}</Text>
                    )}
                  </View>
                  <Text className="text-text-secondary">
                    {ingredient.measurement 
                      ? `${ingredient.measurement.unitQuantity} ${ingredient.measurement.unit}`
                      : ingredient.mengde}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View className="mb-6">
            <Text style={{ color: accentColor }} className="text-xl font-heading-serif mb-3">Fremgangsmåte</Text>
            <View className="bg-white rounded-2xl shadow-sm p-4">
              {recipe.instruksjoner.map((instruction, index) => (
                <View key={index} className="flex-row mb-3">
                  <Text style={{ color: accentColor }} className="font-bold mr-2">{index + 1}.</Text>
                  <Text className="flex-1">{instruction}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Notes */}
          {recipe.notater && (
            <View className="mb-6">
              <Text style={{ color: accentColor }} className="text-xl font-heading-serif mb-2">Notater</Text>
              <View className="bg-white rounded-2xl shadow-sm p-4">
                <Text className="text-text-secondary">{recipe.notater}</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Add to Meal Plan button - only show if onAddToMealPlan is provided */}
        {onAddToMealPlan && recipe && (
          <View className="px-4 py-3 border-t border-gray-200">
            <TouchableOpacity
              className="bg-primary-green rounded-lg py-3 items-center"
              onPress={() => onAddToMealPlan(recipe)}
            >
              <Text className="text-white font-medium">Legg til i måltidsplan</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={closeDrawer}
    >
      <View style={StyleSheet.absoluteFill} className="bg-black/30">
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={closeDrawer}
          activeOpacity={1}
        />
        
        <Animated.View 
          className="bg-primary-light rounded-t-3xl overflow-hidden absolute bottom-0 left-0 right-0"
          style={[
            styles.drawer,
            { transform: [{ translateY }] }
          ]}
        >
          {/* Draggable handle */}
          <View {...panResponder.panHandlers}>
            <View className="w-16 h-1 bg-gray-300 rounded-full self-center mb-2 mt-2" />
          </View>
          
          {/* Main content */}
          <View className="flex-1">
            {renderContent()}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  drawer: {
    height: DRAWER_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  }
}); 