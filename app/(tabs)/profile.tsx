import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';
import { supabase } from '../../lib/supabase';
import { buttonStyles } from '../../lib/theme';
import DietaryRequirements from '../components/DietaryRequirements';
import Allergies from '../components/Allergies';
import FoodPreferences from '../components/FoodPreferences';
import BudgetSettings from '../components/BudgetSettings';
import PortionSettings from '../components/PortionSettings';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Button } from '../../components/ui/Button';
import { Svg, Path } from 'react-native-svg';
import EditProfileForm from '../components/EditProfileForm';
import { useToast } from '../components/ui/Toast';
import ProfileSkeleton from '../components/skeleton/ProfileSkeleton';
import { TopHeader } from '../../components/ui/TopHeader';

const WeightIcon = ({ size = 24, color = "#16A34A" }) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6L6 7M6 7L3 16C2.5 17.5 3 18 4.5 18.5L14.5 21.5C16 22 16.5 21.5 17 20L20 11M6 7L17 3C18.5 2.5 19 3 19.5 4.5L20 11M20 11L21 10"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const HeightIcon = ({ size = 24, color = "#16A34A" }) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22V2M12 22L8 18M12 22L16 18M12 2L8 6M12 2L16 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

interface Profile {
  id: string;
  full_name: string;
  weight: string;
  height: string;
  age: string;
  updated_at: string;
}

interface PreferenceChanges {
  dietary: Set<string>;
  allergies: Set<string>;
  cuisines: Set<string>;
  budget?: {
    amount: string;
    period: 'weekly' | 'monthly';
  };
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuthStore();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferenceChanges, setPreferenceChanges] = useState<PreferenceChanges>({
    dietary: new Set(),
    allergies: new Set(),
    cuisines: new Set()
  });
  const [originalPreferences, setOriginalPreferences] = useState<PreferenceChanges>({
    dietary: new Set(),
    allergies: new Set(),
    cuisines: new Set()
  });

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
    setShowEditForm(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePreferenceChange = (type: keyof PreferenceChanges, values: any) => {
    setPreferenceChanges(prev => ({
      ...prev,
      [type]: values
    }));
  };

  const hasPreferenceChanges = () => {
    const types: (keyof PreferenceChanges)[] = ['dietary', 'allergies', 'cuisines', 'budget'];
    return types.some(type => {
      if (type === 'budget') {
        const original = originalPreferences.budget;
        const current = preferenceChanges.budget;
        if (!original && !current) return false;
        if (!original || !current) return true;
        return original.amount !== current.amount || original.period !== current.period;
      }
      const original = Array.from(originalPreferences[type] as Set<string>);
      const current = Array.from(preferenceChanges[type] as Set<string>);
      return original.length !== current.length || 
             original.some(v => !current.includes(v)) ||
             current.some(v => !original.includes(v));
    });
  };

  const saveAllChanges = async () => {
    try {
      setSaving(true);

      // Save dietary requirements
      await supabase
        .from('dietary_requirements')
        .delete()
        .eq('profile_id', session!.user.id);

      if (preferenceChanges.dietary.size > 0) {
        await supabase
          .from('dietary_requirements')
          .insert(
            Array.from(preferenceChanges.dietary).map(type => ({
              profile_id: session!.user.id,
              requirement_type: type
            }))
          );
      }

      // Save allergies
      await supabase
        .from('allergies')
        .delete()
        .eq('profile_id', session!.user.id);

      if (preferenceChanges.allergies.size > 0) {
        await supabase
          .from('allergies')
          .insert(
            Array.from(preferenceChanges.allergies).map(name => ({
              profile_id: session!.user.id,
              allergy_name: name
            }))
          );
      }

      // Save food preferences
      await supabase
        .from('food_preferences')
        .delete()
        .eq('profile_id', session!.user.id)
        .eq('preference_type', 'cuisine_preference');

      if (preferenceChanges.cuisines.size > 0) {
        await supabase
          .from('food_preferences')
          .insert(
            Array.from(preferenceChanges.cuisines).map(value => ({
              profile_id: session!.user.id,
              preference_type: 'cuisine_preference',
              preference_value: value
            }))
          );
      }

      // Save budget settings if changed
      if (preferenceChanges.budget) {
        const { data: existingBudget } = await supabase
          .from('budget_settings')
          .select('id')
          .eq('profile_id', session!.user.id)
          .single();

        const budgetData = {
          profile_id: session!.user.id,
          amount: Number(preferenceChanges.budget.amount),
          period: preferenceChanges.budget.period
        };

        if (existingBudget?.id) {
          await supabase
            .from('budget_settings')
            .update(budgetData)
            .eq('id', existingBudget.id);
        } else {
          await supabase
            .from('budget_settings')
            .insert([budgetData]);
        }
      }

      // Update original preferences to match current
      setOriginalPreferences({...preferenceChanges});
      
      showToast({
        type: 'success',
        title: 'Lagret',
        message: 'Dine preferanser har blitt oppdatert'
      });

    } catch (error) {
      console.error('Error saving preferences:', error);
      showToast({
        type: 'error',
        title: 'Feil',
        message: 'Det oppstod en feil ved lagring av preferanser'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background pt-12">
        <TopHeader />
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background pt-12">
      <TopHeader />
      <ScrollView className="flex-1">
        <View className="px-5 py-8">
          <Text className="font-heading-medium text-display-small text-primary-Black mb-4">
            Min Profil
          </Text>

          {profile ? (
            <>
              <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
                <View className="flex-row items-center mb-6">
                  <View className="w-16 h-16 bg-primary-Green/10 rounded-full items-center justify-center mb-2">
                    <IconSymbol name="person.fill" size={32} color="#16A34A" />
                  </View>
                  <View className="ml-4">
                    <Text className="text-primary-Black text-xl font-bold">{profile.full_name}</Text>
                    <Text className="text-text-secondary">Sist oppdatert: {new Date(profile.updated_at).toLocaleDateString('no-NO')}</Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap -mx-2">
                  <View className="w-1/2 px-2 mb-4">
                    <View className="bg-gray-50 p-4 rounded-xl">
                      <View className="flex-row items-center mb-2">
                        <WeightIcon size={24} />
                        <Text className="text-text-secondary text-body-medium ml-2">Vekt</Text>
                      </View>
                      <Text className="text-primary-Black text-xl font-semibold">{profile.weight} kg</Text>
                    </View>
                  </View>

                  <View className="w-1/2 px-2 mb-4">
                    <View className="bg-gray-50 p-4 rounded-xl">
                      <View className="flex-row items-center mb-2">
                        <HeightIcon size={24} />
                        <Text className="text-text-secondary text-body-medium ml-2">Høyde</Text>
                      </View>
                      <Text className="text-primary-Black text-xl font-semibold">{profile.height} cm</Text>
                    </View>
                  </View>

                  <View className="w-1/2 px-2">
                    <View className="bg-gray-50 p-4 rounded-xl">
                      <View className="flex-row items-center mb-2">
                        <IconSymbol name="chevron.right" size={24} color="#16A34A" />
                        <Text className="text-text-secondary text-body-medium ml-2">Alder</Text>
                      </View>
                      <Text className="text-primary-Black text-xl font-semibold">{profile.age} år</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Button
                onPress={handleEditProfile}
                className="mb-6"
              >
                Rediger Profil
              </Button>

              {/* Edit Profile Form Modal */}
              {profile && (
                <EditProfileForm
                  profile={profile}
                  visible={showEditForm}
                  onClose={() => setShowEditForm(false)}
                  onSave={fetchProfile}
                />
              )}
            </>
          ) : (
            <View className="bg-white rounded-2xl p-6 mb-6">
              <Text className="text-text-secondary text-body-large">
                Ingen profildata funnet
              </Text>
            </View>
          )}

          {session?.user && (
            <>
              <DietaryRequirements 
                profileId={session.user.id} 
                onChanges={(values) => handlePreferenceChange('dietary', values)}
                setInitialValues={(values) => {
                  setOriginalPreferences(prev => ({...prev, dietary: values}));
                  setPreferenceChanges(prev => ({...prev, dietary: values}));
                }}
              />
              <Allergies 
                profileId={session.user.id}
                onChanges={(values) => handlePreferenceChange('allergies', values)}
                setInitialValues={(values) => {
                  setOriginalPreferences(prev => ({...prev, allergies: values}));
                  setPreferenceChanges(prev => ({...prev, allergies: values}));
                }}
              />
              <FoodPreferences 
                profileId={session.user.id}
                onChanges={(values) => handlePreferenceChange('cuisines', values)}
                setInitialValues={(values) => {
                  setOriginalPreferences(prev => ({...prev, cuisines: values}));
                  setPreferenceChanges(prev => ({...prev, cuisines: values}));
                }}
              />
              <BudgetSettings 
                profileId={session.user.id}
                onChanges={(values) => handlePreferenceChange('budget', values)}
                setInitialValues={(values) => {
                  setOriginalPreferences(prev => ({...prev, budget: values}));
                  setPreferenceChanges(prev => ({...prev, budget: values}));
                }}
              />
              <PortionSettings profileId={session.user.id} />

              {hasPreferenceChanges() && (
                <TouchableOpacity
                  onPress={saveAllChanges}
                  disabled={saving}
                  className="bg-primary-Black py-[18px] rounded-full items-center flex-row justify-center mb-6"
                >
                  <Text className="text-white font-heading-medium text-body-large mr-2">
                    {saving ? 'Lagrer...' : 'Lagre alle endringer'}
                  </Text>
                  <IconSymbol name="chevron.right" size={24} color="white" />
                </TouchableOpacity>
              )}
            </>
          )}

          <View className="flex items-center">
            <TouchableOpacity
              onPress={handleSignOut}
              className={`${buttonStyles.secondary.base} w-full`}
            >
              <Text className={buttonStyles.secondary.text}>
                Logg ut
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 