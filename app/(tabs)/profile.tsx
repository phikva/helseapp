import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@store/authStore';
import { supabase } from '@lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  weight: string;
  height: string;
  age: string;
  updated_at: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/(auth)/profile-setup');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 py-8">
        <Text className="font-heading-medium text-display-small text-primary-Black mb-4">
          Min Profil
        </Text>

        {profile ? (
          <View className="bg-white rounded-2xl p-6 mb-6">
            <View className="mb-4">
              <Text className="text-text-secondary text-body-medium mb-1">Navn</Text>
              <Text className="text-primary-Black text-body-large">{profile.full_name}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-text-secondary text-body-medium mb-1">Vekt</Text>
              <Text className="text-primary-Black text-body-large">{profile.weight} kg</Text>
            </View>

            <View className="mb-4">
              <Text className="text-text-secondary text-body-medium mb-1">Høyde</Text>
              <Text className="text-primary-Black text-body-large">{profile.height} cm</Text>
            </View>

            <View className="mb-4">
              <Text className="text-text-secondary text-body-medium mb-1">Alder</Text>
              <Text className="text-primary-Black text-body-large">{profile.age} år</Text>
            </View>

            <View className="mb-4">
              <Text className="text-text-secondary text-body-medium mb-1">Sist oppdatert</Text>
              <Text className="text-primary-Black text-body-large">
                {new Date(profile.updated_at).toLocaleDateString('no-NO')}
              </Text>
            </View>
          </View>
        ) : (
          <View className="bg-white rounded-2xl p-6 mb-6">
            <Text className="text-text-secondary text-body-large">
              Ingen profildata funnet
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleEditProfile}
          className="bg-primary-Green py-[18px] rounded-full items-center mb-4"
        >
          <Text className="text-text font-heading-medium text-body-large">
            Rediger Profil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-500 py-[18px] rounded-full items-center"
        >
          <Text className="text-white font-heading-medium text-body-large">
            Logg ut
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 