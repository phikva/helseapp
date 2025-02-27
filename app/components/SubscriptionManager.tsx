import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@lib/store/authStore';
import { useSubscriptionStore } from '@lib/store/subscriptionStore';
import { Subscription } from '@lib/services/subscriptionService';
import { IconSymbol } from '../../components/ui/IconSymbol';

interface SubscriptionManagerProps {
  profileId: string;
}

export default function SubscriptionManager({ profileId }: SubscriptionManagerProps) {
  const { 
    subscriptions, 
    currentSubscription, 
    isLoading, 
    error,
    fetchSubscriptions,
    fetchUserSubscription,
    setSubscription
  } = useSubscriptionStore();
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Load all available subscriptions
    fetchSubscriptions();
    
    // Load the user's current subscription
    fetchUserSubscription(profileId);
  }, [profileId]);

  useEffect(() => {
    if (currentSubscription) {
      setSelectedSubscription(currentSubscription._id);
    }
  }, [currentSubscription]);

  const handleSubscriptionChange = async () => {
    if (!profileId || !selectedSubscription) return;
    
    try {
      setUpdating(true);
      await setSubscription(profileId, selectedSubscription);
      Alert.alert('Suksess', 'Abonnementet ditt er oppdatert');
      setExpanded(false);
    } catch (error) {
      console.error('Error updating subscription:', error);
      Alert.alert('Feil', 'Det oppstod en feil ved oppdatering av abonnement');
    } finally {
      setUpdating(false);
    }
  };

  const renderFeatures = (subscription: Subscription) => {
    return (
      <View className="mt-2">
        {subscription.features?.map((feature: string, index: number) => (
          <Text key={index} className="text-gray-700 mb-1">• {feature}</Text>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="bg-primary-light rounded-2xl p-6 mb-6 border border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-heading-serif text-xl text-primary-black">Abonnement</Text>
        </View>
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#055976" />
          <Text className="mt-4 text-text-secondary">Laster abonnementsinformasjon...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-primary-light rounded-2xl p-6 mb-6 border border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-heading-serif text-xl text-primary-black">Abonnement</Text>
        </View>
        <Text className="text-red-500 mb-4">
          Det oppstod en feil ved lasting av abonnementsinformasjon
        </Text>
        <TouchableOpacity 
          className="bg-primary-cyan py-3 px-6 rounded-full self-start"
          onPress={() => {
            fetchSubscriptions();
            fetchUserSubscription(profileId);
          }}
        >
          <Text className="text-white font-medium">Prøv igjen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-primary-light rounded-2xl p-6 mb-6 border border-gray-100">
      <TouchableOpacity 
        className="flex-row justify-between items-center mb-6"
        onPress={() => setExpanded(!expanded)}
      >
        <Text className="font-heading-serif text-3xl text-primary-black">Abonnement</Text>
        <View className="bg-primary-cyan/10 p-2 rounded-full">
          <IconSymbol 
            name={expanded ? "chevron.up" : "chevron.down"} 
            size={20} 
            color="#055976" 
          />
        </View>
      </TouchableOpacity>

      {currentSubscription && !expanded && (
        <View className="bg-primary-cyan/5 p-5 rounded-xl mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-primary-black text-lg font-semibold">{currentSubscription.name}</Text>
            <View className="bg-primary-cyan/10 px-3 py-1 rounded-full">
              <Text className="text-primary-cyan font-bold">{currentSubscription.price} kr/mnd</Text>
            </View>
          </View>
          <Text className="text-text-secondary mt-1">{currentSubscription.description}</Text>
          
          <TouchableOpacity 
            className="mt-4 flex-row items-center"
            onPress={() => setExpanded(true)}
          >
            <Text className="text-primary-cyan font-medium mr-2">Se alle abonnementer</Text>
            <IconSymbol name="chevron.right" size={16} color="#055976" />
          </TouchableOpacity>
        </View>
      )}

      {expanded && (
        <View>
          <Text className="text-text-secondary text-lg mb-6">Velg abonnement som passer for deg:</Text>
          
          {subscriptions.map((subscription) => (
            <TouchableOpacity
              key={subscription._id}
              className={`border-2 rounded-xl p-5 mb-5 ${
                selectedSubscription === subscription._id 
                  ? 'border-primary-cyan bg-primary-cyan/5' 
                  : 'border-gray-200 bg-primary-light'
              }`}
              onPress={() => setSelectedSubscription(subscription._id)}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-semibold text-primary-black">{subscription.name}</Text>
                <View className={`px-3 py-1 rounded-full ${
                  selectedSubscription === subscription._id 
                    ? 'bg-primary-cyan/10' 
                    : 'bg-primary-light border border-gray-100'
                }`}>
                  <Text className={`text-lg font-bold ${
                    selectedSubscription === subscription._id 
                      ? 'text-primary-cyan' 
                      : 'text-gray-700'
                  }`}>{subscription.price} kr/mnd</Text>
                </View>
              </View>
              
              <Text className="text-text-secondary mt-2">{subscription.description}</Text>
              
              <View className="mt-4">
                {subscription.features?.map((feature: string, index: number) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <View className={`w-5 h-5 rounded-full items-center justify-center mr-2 ${
                      selectedSubscription === subscription._id 
                        ? 'bg-primary-cyan' 
                        : 'bg-gray-200'
                    }`}>
                      <IconSymbol name="checkmark.circle.fill" size={12} color="white" />
                    </View>
                    <Text className="text-gray-700">{feature}</Text>
                  </View>
                ))}
              </View>
              
              {currentSubscription?._id === subscription._id && (
                <View className="mt-4 bg-primary-cyan/10 py-2 px-4 rounded-full self-start">
                  <Text className="text-primary-cyan font-medium">Nåværende abonnement</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          {selectedSubscription && selectedSubscription !== currentSubscription?._id && (
            <TouchableOpacity
              className="bg-primary-cyan py-4 rounded-full mt-4 mb-2"
              onPress={handleSubscriptionChange}
              disabled={updating}
            >
              <Text className="text-white font-bold text-center text-lg">
                {updating ? 'Oppdaterer...' : 'Bytt abonnement'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
} 