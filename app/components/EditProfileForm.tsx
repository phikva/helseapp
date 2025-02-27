import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated, Dimensions, PanResponder, StatusBar, Modal, StyleSheet } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from './ui/Toast';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Button } from '../../components/ui/Button';
import { colors } from '../../lib/theme';
import { Ionicons } from '@expo/vector-icons';

// Get screen dimensions
const { height, width } = Dimensions.get('window');

interface EditProfileFormProps {
  profile: {
    id: string;
    full_name: string;
    weight: string;
    height: string;
    age: string;
  };
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EditProfileForm({ profile, visible, onClose, onSave }: EditProfileFormProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    weight: profile.weight,
    height: profile.height,
    age: profile.age
  });
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const translateY = useRef(new Animated.Value(height)).current;
  
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
        if (gestureState.dy > height * 0.2 || gestureState.vy > 0.5) {
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

  // Open drawer animation
  useEffect(() => {
    if (visible) {
      openDrawer();
    }
  }, [visible]);

  const openDrawer = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const validateProfile = () => {
    if (!formData.full_name.trim()) {
      showToast({
        type: 'error',
        title: 'Mangler navn',
        message: 'Vennligst fyll inn navnet ditt'
      });
      return false;
    }
    if (!formData.weight || isNaN(Number(formData.weight)) || Number(formData.weight) < 20 || Number(formData.weight) > 300) {
      showToast({
        type: 'error',
        title: 'Ugyldig vekt',
        message: 'Vennligst fyll inn en gyldig vekt (20-300 kg)'
      });
      return false;
    }
    if (!formData.height || isNaN(Number(formData.height)) || Number(formData.height) < 100 || Number(formData.height) > 250) {
      showToast({
        type: 'error',
        title: 'Ugyldig høyde',
        message: 'Vennligst fyll inn en gyldig høyde (100-250 cm)'
      });
      return false;
    }
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 13 || Number(formData.age) > 120) {
      showToast({
        type: 'error',
        title: 'Ugyldig alder',
        message: 'Vennligst fyll inn en gyldig alder (13-120 år)'
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateProfile()) {
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          weight: formData.weight,
          height: formData.height,
          age: formData.age,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      onSave();
      closeDrawer();
      showToast({
        type: 'success',
        title: 'Suksess',
        message: 'Profilen din har blitt oppdatert'
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast({
        type: 'error',
        title: 'Feil ved lagring',
        message: 'Det oppstod en feil ved oppdatering av profilen din. Vennligst prøv igjen.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={closeDrawer}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Backdrop */}
      <View style={StyleSheet.absoluteFill} className="bg-black/30">
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={closeDrawer}
          activeOpacity={1}
        />
        
        {/* Full Screen Drawer */}
        <Animated.View 
          className="bg-white rounded-t-3xl overflow-hidden absolute bottom-0 left-0 right-0"
          style={{ 
            transform: [{ translateY }],
            height: height * 0.95, // 95% of screen height
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 10
          }}
        >
          {/* Draggable handle */}
          <View {...panResponder.panHandlers}>
            <View className="w-16 h-1 bg-gray-300 rounded-full self-center mb-4 mt-2" />
          </View>
          
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 mb-6">
            <Text className="text-xl font-bold text-primary-black">Rediger Profil</Text>
            <TouchableOpacity onPress={closeDrawer}>
              <Ionicons name="close" size={24} color={colors.primary.black} />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 px-6">
            {/* Personal Data Section */}
            <View className="mb-6">
              <Text className="text-primary-green text-xl font-semibold mb-4">Personlige data</Text>
            </View>

            {/* Full Name Input */}
            <View className="mb-6">
              <Text className="font-body text-body-medium text-text-secondary mb-2">
                Fullt navn
              </Text>
              <TextInput
                value={formData.full_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                className="bg-primary-light rounded-2xl py-4 px-5 font-body text-body-large"
                autoCapitalize="words"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            {/* Weight Input with icon */}
            <View className="mb-6">
              <Text className="font-body text-body-medium text-text-secondary mb-2">
                Vekt (kg)
              </Text>
              <View className="flex-row items-center bg-primary-light rounded-2xl">
                <View className="pl-5 pr-2">
                  <View className="w-6 h-6 bg-primary-green/10 rounded-full items-center justify-center">
                    <IconSymbol name="person.fill" size={14} color={colors.primary.green} />
                  </View>
                </View>
                <TextInput
                  value={formData.weight}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                  keyboardType="numeric"
                  className="flex-1 py-4 pr-5 font-body text-body-large"
                  maxLength={3}
                  placeholderTextColor={colors.text.secondary}
                />
              </View>
            </View>

            {/* Height Input with icon */}
            <View className="mb-6">
              <Text className="font-body text-body-medium text-text-secondary mb-2">
                Høyde (cm)
              </Text>
              <View className="flex-row items-center bg-primary-light rounded-2xl">
                <View className="pl-5 pr-2">
                  <View className="w-6 h-6 bg-primary-green/10 rounded-full items-center justify-center">
                    <IconSymbol name="chevron.up" size={14} color={colors.primary.green} />
                  </View>
                </View>
                <TextInput
                  value={formData.height}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, height: text }))}
                  keyboardType="numeric"
                  className="flex-1 py-4 pr-5 font-body text-body-large"
                  maxLength={3}
                  placeholderTextColor={colors.text.secondary}
                />
              </View>
            </View>

            {/* Age Input with icon */}
            <View className="mb-8">
              <Text className="font-body text-body-medium text-text-secondary mb-2">
                Alder
              </Text>
              <View className="flex-row items-center bg-primary-light rounded-2xl">
                <View className="pl-5 pr-2">
                  <View className="w-6 h-6 bg-primary-green/10 rounded-full items-center justify-center">
                    <IconSymbol name="person.fill" size={14} color={colors.primary.green} />
                  </View>
                </View>
                <TextInput
                  value={formData.age}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
                  keyboardType="numeric"
                  className="flex-1 py-4 pr-5 font-body text-body-large"
                  maxLength={3}
                  placeholderTextColor={colors.text.secondary}
                />
              </View>
            </View>
          </ScrollView>
          
          {/* Fixed bottom button */}
          <View className="px-6 py-4 border-t border-gray-100">
            <Button
              onPress={handleSave}
              disabled={loading}
              className="bg-primary-green"
            >
              {loading ? 'Lagrer...' : 'Lagre endringer'}
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
} 