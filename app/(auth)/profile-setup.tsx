import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@store/authStore';
import { supabase } from '@lib/supabase';

interface UserProfile {
  full_name: string;
  weight: string;
  height: string;
  age: string;
}

export default function ProfileSetup() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    weight: '',
    height: '',
    age: ''
  });
  const [loading, setLoading] = useState(false);

  const validateProfile = () => {
    if (!profile.full_name.trim()) {
      Alert.alert('Mangler navn', 'Vennligst fyll inn navnet ditt');
      return false;
    }
    if (!profile.weight || isNaN(Number(profile.weight)) || Number(profile.weight) < 20 || Number(profile.weight) > 300) {
      Alert.alert('Ugyldig vekt', 'Vennligst fyll inn en gyldig vekt (20-300 kg)');
      return false;
    }
    if (!profile.height || isNaN(Number(profile.height)) || Number(profile.height) < 100 || Number(profile.height) > 250) {
      Alert.alert('Ugyldig høyde', 'Vennligst fyll inn en gyldig høyde (100-250 cm)');
      return false;
    }
    if (!profile.age || isNaN(Number(profile.age)) || Number(profile.age) < 13 || Number(profile.age) > 120) {
      Alert.alert('Ugyldig alder', 'Vennligst fyll inn en gyldig alder (13-120 år)');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!session?.user) {
      Alert.alert('Feil', 'Du må være logget inn for å opprette profil');
      return;
    }

    if (!validateProfile()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: profile.full_name.trim(),
          weight: profile.weight,
          height: profile.height,
          age: profile.age,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Navigate to main app after saving
      router.replace('/(tabs)');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(
        'Feil ved lagring',
        'Det oppstod en feil ved lagring av profilen din. Vennligst prøv igjen.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 py-40Phil">
        <Text className="font-heading-medium text-display-small text-primary-Black mb-4">
          La oss bli litt bedre kjent!
        </Text>
        <Text className="font-body text-body-large text-text-secondary mb-8">
          Fyll inn litt info om deg selv
        </Text>

        {/* Full Name Input */}
        <View className="mb-6">
          <TextInput
            placeholder="Fullt navn"
            value={profile.full_name}
            onChangeText={(text) => setProfile(prev => ({ ...prev, full_name: text }))}
            className="bg-white rounded-2xl py-4 px-5 font-body text-body-large"
            autoCapitalize="words"
          />
        </View>

        {/* Weight Input */}
        <View className="mb-6">
          <TextInput
            placeholder="Vekt (kg)"
            value={profile.weight}
            onChangeText={(text) => setProfile(prev => ({ ...prev, weight: text }))}
            keyboardType="numeric"
            className="bg-white rounded-2xl py-4 px-5 font-body text-body-large"
            maxLength={3}
          />
        </View>

        {/* Height Input */}
        <View className="mb-6">
          <TextInput
            placeholder="Høyde (cm)"
            value={profile.height}
            onChangeText={(text) => setProfile(prev => ({ ...prev, height: text }))}
            keyboardType="numeric"
            className="bg-white rounded-2xl py-4 px-5 font-body text-body-large"
            maxLength={3}
          />
        </View>

        {/* Age Input */}
        <View className="mb-8">
          <TextInput
            placeholder="Alder"
            value={profile.age}
            onChangeText={(text) => setProfile(prev => ({ ...prev, age: text }))}
            keyboardType="numeric"
            className="bg-white rounded-2xl py-4 px-5 font-body text-body-large"
            maxLength={3}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-primary-Green py-[18px] rounded-full items-center mb-4"
        >
          <Text className="text-text font-heading-medium text-body-large">
            {loading ? 'Lagrer...' : 'Fortsett'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <Text className="text-center text-primary-Black text-body-medium">
            Fyll ut senere
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 