import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions, Switch } from 'react-native';
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
import SubscriptionManager from '../components/SubscriptionManager';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Button } from '../../components/ui/Button';
import { Svg, Path } from 'react-native-svg';
import EditProfileForm from '../components/EditProfileForm';
import { useToast } from '../components/ui/Toast';
import ProfileSkeleton from '../components/skeleton/ProfileSkeleton';
import DietaryRequirementsSkeleton from '../components/skeleton/DietaryRequirementsSkeleton';
import AllergiesSkeleton from '../components/skeleton/AllergiesSkeleton';
import FoodPreferencesSkeleton from '../components/skeleton/FoodPreferencesSkeleton';
import BudgetSettingsSkeleton from '../components/skeleton/BudgetSettingsSkeleton';
import PortionSettingsSkeleton from '../components/skeleton/PortionSettingsSkeleton';
import { TopHeader } from '../../components/ui/TopHeader';
import { useProfileStore } from '../../lib/store/profileStore';

const { width } = Dimensions.get('window');

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
  portions?: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuthStore();
  const { showToast } = useToast();
  const { profile, loading: profileLoading, refreshProfile, isStale } = useProfileStore();
  const [showEditForm, setShowEditForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: false,
    darkMode: false
  });
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

  // Custom tab implementation
  const [activeTab, setActiveTab] = useState('profile');
  const tabs = [
    { key: 'profile', title: 'Profil' },
    { key: 'subscription', title: 'Abonnement' },
    { key: 'preferences', title: 'Preferanser' },
    { key: 'settings', title: 'Innstillinger' },
  ];

  useEffect(() => {
    // If profile data is stale, refresh it
    if (session?.user && isStale()) {
      refreshProfile();
    }
  }, [session, isStale]);

  // Add effect to refresh data when switching to preferences tab
  useEffect(() => {
    if (activeTab === 'preferences' && session?.user) {
      // Check if data is stale before refreshing
      if (isStale()) {
        refreshProfile();
      }
    }
  }, [activeTab, isStale, session]);

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
    const types: (keyof PreferenceChanges)[] = ['dietary', 'allergies', 'cuisines', 'budget', 'portions'];
    return types.some(type => {
      if (type === 'budget') {
        const original = originalPreferences.budget;
        const current = preferenceChanges.budget;
        if (!original && !current) return false;
        if (!original || !current) return true;
        return original.amount !== current.amount || original.period !== current.period;
      }
      if (type === 'portions') {
        return originalPreferences.portions !== preferenceChanges.portions;
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

      // Save portion settings if changed
      if (preferenceChanges.portions !== undefined && preferenceChanges.portions !== originalPreferences.portions) {
        const { data: existingPortions } = await supabase
          .from('portion_settings')
          .select('id')
          .eq('profile_id', session!.user.id)
          .single();

        const portionData = {
          profile_id: session!.user.id,
          number_of_people: preferenceChanges.portions
        };

        if (existingPortions?.id) {
          await supabase
            .from('portion_settings')
            .update(portionData)
            .eq('id', existingPortions.id);
        } else {
          await supabase
            .from('portion_settings')
            .insert([portionData]);
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

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = () => {
    showToast({
      type: 'success',
      title: 'Lagret',
      message: 'Innstillingene har blitt oppdatert'
    });
  };

  // Tab content components
  const renderProfileTab = () => {
    if (profileLoading) {
      return (
        <ScrollView className="flex-1 px-5 pt-4 bg-primary-light">
          <View className="bg-primary-light rounded-2xl p-6 mb-4 shadow-sm">
            {/* Profile Header */}
            <View className="flex-row items-center mb-6">
              <View className="w-16 h-16 bg-gray-200 rounded-full" />
              <View className="ml-4">
                <View className="h-7 w-40 bg-gray-200 rounded mb-2" />
                <View className="h-5 w-48 bg-gray-200 rounded" />
              </View>
            </View>

            {/* Stats Grid */}
            <View className="bg-primary-light p-4 rounded-xl mb-4">
              <View className="h-6 w-40 bg-gray-200 rounded mb-3" />
              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-gray-200 rounded-full" />
                    <View className="h-5 w-16 bg-gray-200 rounded ml-2" />
                  </View>
                  <View className="h-7 w-20 bg-gray-200 rounded" />
                </View>
                
                <View className="h-[1px] bg-gray-200" />
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-gray-200 rounded-full" />
                    <View className="h-5 w-16 bg-gray-200 rounded ml-2" />
                  </View>
                  <View className="h-7 w-20 bg-gray-200 rounded" />
                </View>
                
                <View className="h-[1px] bg-gray-200" />
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-gray-200 rounded-full" />
                    <View className="h-5 w-16 bg-gray-200 rounded ml-2" />
                  </View>
                  <View className="h-7 w-20 bg-gray-200 rounded" />
                </View>
              </View>
            </View>
          </View>

          <View className="h-14 bg-gray-200 rounded-full mb-6" />
        </ScrollView>
      );
    }

    return (
      <ScrollView className="flex-1 px-5 pt-4 bg-primary-light">
        {profile ? (
          <>
            <View className="bg-primary-light rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
              {/* Enhanced Profile Header */}
              <View className="items-center mb-6">
                <View className="w-24 h-24 bg-primary-green/10 rounded-full items-center justify-center mb-4">
                  <IconSymbol name="person.fill" size={40} color="#4A6C62" />
                </View>
                <Text className="text-primary-black text-2xl font-bold text-center">{profile.full_name}</Text>
                <Text className="text-text-secondary text-center mt-1">Sist oppdatert: {new Date(profile.updated_at).toLocaleDateString('no-NO')}</Text>
              </View>

              {/* Improved stats section with better UI */}
              <View className="bg-primary-light p-5 rounded-xl mb-4 border border-gray-100">
                <Text className="text-primary-green text-xl font-semibold mb-4">Personlige data</Text>
                <View className="space-y-4">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary-green/10 rounded-full items-center justify-center">
                      <WeightIcon size={20} color="#4A6C62" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-text-secondary text-body-medium">Vekt</Text>
                      <Text className="text-primary-green text-xl font-semibold">{profile.weight} kg</Text>
                    </View>
                  </View>
                  
                  <View className="h-[1px] bg-primary-green/10" />
                  
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary-green/10 rounded-full items-center justify-center">
                      <HeightIcon size={20} color="#4A6C62" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-text-secondary text-body-medium">Høyde</Text>
                      <Text className="text-primary-green text-xl font-semibold">{profile.height} cm</Text>
                    </View>
                  </View>
                  
                  <View className="h-[1px] bg-primary-green/10" />
                  
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary-green/10 rounded-full items-center justify-center">
                      <IconSymbol name="person.fill" size={20} color="#4A6C62" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-text-secondary text-body-medium">Alder</Text>
                      <Text className="text-primary-green text-xl font-semibold">{profile.age} år</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <Button
              onPress={handleEditProfile}
              className="mb-8 bg-primary-green"
            >
              Rediger Profil
            </Button>

            {/* Edit Profile Form Modal */}
            {profile && (
              <EditProfileForm
                profile={profile}
                visible={showEditForm}
                onClose={() => setShowEditForm(false)}
                onSave={refreshProfile}
              />
            )}
          </>
        ) : (
          <View className="bg-primary-light rounded-2xl p-6 mb-6 border border-gray-100">
            <Text className="text-text-secondary text-body-large">
              Ingen profildata funnet
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderSubscriptionTab = () => {
    if (profileLoading) {
      return (
        <ScrollView className="flex-1 px-5 pt-4 bg-primary-light">
          <View className="bg-primary-light rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
            <View className="h-7 w-40 bg-gray-200 rounded mb-4" />
            <View className="h-5 w-64 bg-gray-200 rounded mb-6" />
            
            {/* Subscription Plans */}
            <View className="space-y-4 mb-6">
              {[1, 2, 3].map((item) => (
                <View key={item} className="border border-gray-200 rounded-xl p-4 bg-primary-light">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="h-6 w-24 bg-gray-200 rounded" />
                    <View className="h-8 w-20 bg-gray-200 rounded-full" />
                  </View>
                  <View className="h-4 w-full bg-gray-200 rounded mb-2" />
                  <View className="h-4 w-3/4 bg-gray-200 rounded mb-4" />
                  <View className="space-y-2">
                    {[1, 2, 3].map((feature) => (
                      <View key={feature} className="flex-row items-center">
                        <View className="w-5 h-5 bg-gray-200 rounded-full mr-2" />
                        <View className="h-4 w-56 bg-gray-200 rounded" />
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
            
            <View className="h-14 bg-gray-200 rounded-full" />
          </View>
        </ScrollView>
      );
    }
    
    return (
      <ScrollView className="flex-1 px-5 pt-4 bg-primary-light">
        {session?.user && (
          <SubscriptionManager 
            profileId={session.user.id} 
          />
        )}
      </ScrollView>
    );
  };

  const renderPreferencesTab = () => {
    if (profileLoading) {
      return (
        <ScrollView className="flex-1 px-5 pt-4 bg-primary-light">
          <DietaryRequirementsSkeleton />
          <AllergiesSkeleton />
          <FoodPreferencesSkeleton />
          <BudgetSettingsSkeleton />
          <PortionSettingsSkeleton />
        </ScrollView>
      );
    }
    
    return (
      <ScrollView className="flex-1 px-5 pt-4 bg-primary-light">
        {session?.user && (
          <>
            <DietaryRequirements 
              profileId={session.user.id} 
              onChanges={(values) => handlePreferenceChange('dietary', values)}
              setInitialValues={(values) => {
                setOriginalPreferences(prev => ({...prev, dietary: values}));
                setPreferenceChanges(prev => ({...prev, dietary: values}));
              }}
              cachedData={true}
            />
            <Allergies 
              profileId={session.user.id}
              onChanges={(values) => handlePreferenceChange('allergies', values)}
              setInitialValues={(values) => {
                setOriginalPreferences(prev => ({...prev, allergies: values}));
                setPreferenceChanges(prev => ({...prev, allergies: values}));
              }}
              cachedData={true}
            />
            <FoodPreferences 
              profileId={session.user.id}
              onChanges={(values) => handlePreferenceChange('cuisines', values)}
              setInitialValues={(values) => {
                setOriginalPreferences(prev => ({...prev, cuisines: values}));
                setPreferenceChanges(prev => ({...prev, cuisines: values}));
              }}
              cachedData={true}
            />
            <BudgetSettings 
              profileId={session.user.id}
              onChanges={(values) => handlePreferenceChange('budget', values)}
              setInitialValues={(values) => {
                setOriginalPreferences(prev => ({...prev, budget: values}));
                setPreferenceChanges(prev => ({...prev, budget: values}));
              }}
              cachedData={true}
            />
            <PortionSettings 
              profileId={session.user.id} 
              onChanges={(value) => handlePreferenceChange('portions', value)}
              setInitialValues={(value) => {
                setOriginalPreferences(prev => ({...prev, portions: value}));
                setPreferenceChanges(prev => ({...prev, portions: value}));
              }}
              cachedData={true}
            />
          </>
        )}
      </ScrollView>
    );
  };

  const renderSettingsTab = () => {
    if (profileLoading) {
      return (
        <ScrollView className="flex-1 px-5 pt-4 bg-primary-light">
          <View className="bg-primary-light rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
            <View className="h-7 w-40 bg-gray-200 rounded mb-4" />
            
            <View className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <View key={item} className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-gray-200 rounded-full" />
                    <View className="ml-3">
                      <View className="h-5 w-32 bg-gray-200 rounded mb-1" />
                      <View className="h-4 w-48 bg-gray-200 rounded" />
                    </View>
                  </View>
                  <View className="w-12 h-6 bg-gray-200 rounded-full" />
                </View>
              ))}
            </View>
          </View>
          
          <View className="bg-primary-light rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
            <View className="h-7 w-40 bg-gray-200 rounded mb-4" />
            <View className="space-y-4">
              {[1, 2].map((item) => (
                <View key={item} className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-gray-200 rounded-full" />
                    <View className="ml-3">
                      <View className="h-5 w-32 bg-gray-200 rounded mb-1" />
                      <View className="h-4 w-48 bg-gray-200 rounded" />
                    </View>
                  </View>
                  <View className="w-12 h-6 bg-gray-200 rounded-full" />
                </View>
              ))}
            </View>
          </View>
          
          <View className="h-14 bg-gray-200 rounded-full mb-6" />
        </ScrollView>
      );
    }
    
    return (
      <ScrollView className="flex-1 px-5 pt-4 bg-primary-light">
        <View className="bg-primary-light rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-primary-green text-xl font-bold mb-6">Appinnstillinger</Text>
          
          <View className="space-y-6">
            <TouchableOpacity className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-primary-green/10 rounded-full items-center justify-center">
                  <IconSymbol name="bell.fill" size={20} color="#4A6C62" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-primary-black text-body-large font-medium">Påminnelser</Text>
                  <Text className="text-text-secondary text-body-small mt-1">Få påminnelser om måltider</Text>
                </View>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => handleSettingChange('notifications', value)}
                trackColor={{ false: '#E5E7EB', true: '#4A6C62' }}
                thumbColor="#FFFFFF"
              />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-primary-green/10 rounded-full items-center justify-center">
                  <IconSymbol name="moon.fill" size={20} color="#4A6C62" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-primary-black text-body-large font-medium">Mørk modus</Text>
                  <Text className="text-text-secondary text-body-small mt-1">Bytt til mørkt tema</Text>
                </View>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => handleSettingChange('darkMode', value)}
                trackColor={{ false: '#E5E7EB', true: '#4A6C62' }}
                thumbColor="#FFFFFF"
              />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-primary-green/10 rounded-full items-center justify-center">
                  <IconSymbol name="hand.raised.fill" size={20} color="#4A6C62" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-primary-black text-body-large font-medium">Personvern</Text>
                  <Text className="text-text-secondary text-body-small mt-1">Administrer personverninnstillinger</Text>
                </View>
              </View>
              <View className="bg-primary-light rounded-full p-2 border border-gray-100">
                <IconSymbol name="chevron.right" size={20} color="#4A6C62" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-primary-green/10 rounded-full items-center justify-center">
                  <IconSymbol name="questionmark.circle.fill" size={20} color="#4A6C62" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-primary-black text-body-large font-medium">Hjelp & støtte</Text>
                  <Text className="text-text-secondary text-body-small mt-1">Få hjelp med appen</Text>
                </View>
              </View>
              <View className="bg-primary-light rounded-full p-2 border border-gray-100">
                <IconSymbol name="chevron.right" size={20} color="#4A6C62" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="bg-primary-light rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-primary-green text-xl font-bold mb-6">Konto</Text>
          
          <View className="space-y-6">
            <TouchableOpacity className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
                  <IconSymbol name="trash.fill" size={20} color="#EF4444" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-red-500 text-body-large font-medium">Slett konto</Text>
                  <Text className="text-text-secondary text-body-small mt-1">Slett all data permanent</Text>
                </View>
              </View>
              <View className="bg-red-50 rounded-full p-2">
                <IconSymbol name="chevron.right" size={20} color="#EF4444" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center justify-between"
              onPress={handleSignOut}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-primary-green/10 rounded-full items-center justify-center">
                  <IconSymbol name="arrow.right.square.fill" size={20} color="#4A6C62" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-primary-black text-body-large font-medium">Logg ut</Text>
                  <Text className="text-text-secondary text-body-small mt-1">Logg ut av kontoen din</Text>
                </View>
              </View>
              <View className="bg-primary-light rounded-full p-2 border border-gray-100">
                <IconSymbol name="chevron.right" size={20} color="#4A6C62" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        <Button
          onPress={handleSaveSettings}
          className="mb-8 bg-primary-green"
        >
          Lagre innstillinger
        </Button>
      </ScrollView>
    );
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'subscription':
        return renderSubscriptionTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderProfileTab();
    }
  };

  // Custom tab bar
  const renderTabBar = () => (
    <View className="flex-row bg-white border-b border-gray-200">
      {tabs.map((tab, index) => {
        // Assign different colors to each tab
        let activeColor;
        switch (index) {
          case 0: // Profile tab
            activeColor = 'text-primary-green';
            break;
          case 1: // Subscription tab
            activeColor = 'text-primary-cyan';
            break;
          case 2: // Preferences tab
            activeColor = 'text-primary-purple';
            break;
          case 3: // Settings tab
            activeColor = 'text-primary-green';
            break;
          default:
            activeColor = 'text-primary-green';
        }
        
        return (
          <TouchableOpacity
            key={tab.key}
            className="flex-1 py-3 items-center"
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text 
              className={`font-medium text-base ${
                activeTab === tab.key 
                  ? activeColor + ' font-bold' 
                  : 'text-gray-500'
              }`}
            >
              {tab.title}
            </Text>
            {activeTab === tab.key && (
              <View className={`absolute bottom-0 left-6 right-6 h-1 ${
                index === 0 ? 'bg-primary-green' :
                index === 1 ? 'bg-primary-cyan' :
                index === 2 ? 'bg-primary-purple' :
                'bg-primary-green'
              } rounded-t-full`} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (profileLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-light pt-12">
        <TopHeader />
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-light pt-12">
      <TopHeader />
      <View className="px-5 py-4">
        <Text className="font-heading-serif text-display-small text-primary-black mb-2">
          Min Profil
        </Text>
      </View>
      
      {renderTabBar()}
      <View className="flex-1 bg-primary-light">
        {renderTabContent()}
      </View>
      
      <View className="p-5">
        {activeTab === 'preferences' && hasPreferenceChanges() && (
          <Button
            onPress={saveAllChanges}
            disabled={saving}
            variant="secondary"
            className="w-full mb-4 bg-primary-purple"
          >
            {saving ? 'Lagrer...' : 'Lagre alle endringer'}
          </Button>
        )}
        <Button
          onPress={handleSignOut}
          variant="outline"
          className={`w-full border-${
            activeTab === 'profile' ? 'primary-green' : 
            activeTab === 'subscription' ? 'primary-cyan' : 
            activeTab === 'preferences' ? 'primary-purple' : 
            'primary-green'
          } text-${
            activeTab === 'profile' ? 'primary-green' : 
            activeTab === 'subscription' ? 'primary-cyan' : 
            activeTab === 'preferences' ? 'primary-purple' : 
            'primary-green'
          }`}
        >
          Logg ut
        </Button>
      </View>
    </SafeAreaView>
  );
} 