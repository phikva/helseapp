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
      <View className="bg-white rounded-2xl p-6 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-heading-serif text-lg text-primary-Black">Abonnement</Text>
        </View>
        <View className="items-center py-4">
          <ActivityIndicator size="small" color="#16A34A" />
          <Text className="mt-2 text-text-secondary">Laster abonnementsinformasjon...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-white rounded-2xl p-6 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-heading-medium text-lg text-primary-Black">Abonnement</Text>
        </View>
        <Text className="text-red-500 mb-4">
          Det oppstod en feil ved lasting av abonnementsinformasjon
        </Text>
        <TouchableOpacity 
          className="bg-primary-Green py-2 px-4 rounded-lg self-start"
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
    <View className="bg-white rounded-2xl p-6 mb-6">
      <TouchableOpacity 
        className="flex-row justify-between items-center mb-4"
        onPress={() => setExpanded(!expanded)}
      >
        <Text className="font-heading-medium text-lg text-primary-Black">Abonnement</Text>
        <IconSymbol 
          name={expanded ? "chevron.up" : "chevron.down"} 
          size={24} 
          color="#16A34A" 
        />
      </TouchableOpacity>

      {currentSubscription && !expanded && (
        <View className="bg-gray-50 p-4 rounded-xl mb-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-primary-Black text-lg font-semibold">{currentSubscription.name}</Text>
            <Text className="text-primary-Green font-bold">{currentSubscription.price} kr/mnd</Text>
          </View>
          <Text className="text-text-secondary mt-1">{currentSubscription.description}</Text>
        </View>
      )}

      {expanded && (
        <View>
          <Text className="text-text-secondary mb-4">Velg abonnement som passer for deg:</Text>
          
          {subscriptions.map((subscription) => (
            <TouchableOpacity
              key={subscription._id}
              className={`border rounded-lg p-4 mb-4 ${
                selectedSubscription === subscription._id 
                  ? 'border-primary-Green bg-primary-Green/5' 
                  : 'border-gray-300'
              }`}
              onPress={() => setSelectedSubscription(subscription._id)}
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold">{subscription.name}</Text>
                <Text className="text-lg font-bold text-primary-Green">{subscription.price} kr/mnd</Text>
              </View>
              
              <Text className="text-gray-600 mt-2">{subscription.description}</Text>
              
              {renderFeatures(subscription)}
              
              {currentSubscription?._id === subscription._id && (
                <View className="mt-3 bg-green-100 py-1 px-3 rounded self-start">
                  <Text className="text-green-800 font-medium">Nåværende abonnement</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          {selectedSubscription && selectedSubscription !== currentSubscription?._id && (
            <TouchableOpacity
              className="bg-primary-Green py-4 rounded-lg mt-2 mb-2"
              onPress={handleSubscriptionChange}
              disabled={updating}
            >
              <Text className="text-white font-bold text-center">
                {updating ? 'Oppdaterer...' : 'Bytt abonnement'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
} 