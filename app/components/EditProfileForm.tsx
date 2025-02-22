import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from './ui/Toast';

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
      onClose();
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
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl p-6 h-5/6">
          <ScrollView>
            <View className="flex-row justify-between items-center mb-8">
              <Text className="font-heading-medium text-display-small text-primary-Black">
                Rediger Profil
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-text-secondary text-body-large">Lukk</Text>
              </TouchableOpacity>
            </View>

            {/* Full Name Input */}
            <View className="mb-6">
              <Text className="font-body text-body-medium text-text-secondary mb-2">
                Fullt navn
              </Text>
              <TextInput
                value={formData.full_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                className="bg-gray-50 rounded-2xl py-4 px-5 font-body text-body-large"
                autoCapitalize="words"
              />
            </View>

            {/* Weight Input */}
            <View className="mb-6">
              <Text className="font-body text-body-medium text-text-secondary mb-2">
                Vekt (kg)
              </Text>
              <TextInput
                value={formData.weight}
                onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                keyboardType="numeric"
                className="bg-gray-50 rounded-2xl py-4 px-5 font-body text-body-large"
                maxLength={3}
              />
            </View>

            {/* Height Input */}
            <View className="mb-6">
              <Text className="font-body text-body-medium text-text-secondary mb-2">
                Høyde (cm)
              </Text>
              <TextInput
                value={formData.height}
                onChangeText={(text) => setFormData(prev => ({ ...prev, height: text }))}
                keyboardType="numeric"
                className="bg-gray-50 rounded-2xl py-4 px-5 font-body text-body-large"
                maxLength={3}
              />
            </View>

            {/* Age Input */}
            <View className="mb-8">
              <Text className="font-body text-body-medium text-text-secondary mb-2">
                Alder
              </Text>
              <TextInput
                value={formData.age}
                onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
                keyboardType="numeric"
                className="bg-gray-50 rounded-2xl py-4 px-5 font-body text-body-large"
                maxLength={3}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              className="bg-primary-Green py-[18px] rounded-full items-center mb-4"
            >
              <Text className="text-text font-heading-medium text-body-large">
                {loading ? 'Lagrer...' : 'Lagre endringer'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
} 