import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface BudgetSetting {
  id: string;
  amount: number;
  period: string;
}

interface BudgetSettingsProps {
  profileId: string;
  onChanges?: (values: { amount: string; period: 'weekly' | 'monthly' }) => void;
  setInitialValues?: (values: { amount: string; period: 'weekly' | 'monthly' }) => void;
}

export default function BudgetSettings({ profileId, onChanges, setInitialValues }: BudgetSettingsProps) {
  const [budget, setBudget] = useState<BudgetSetting | null>(null);
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const { data, error } = await supabase
        .from('budget_settings')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setBudget(data);
        setAmount(data.amount.toString());
        setPeriod(data.period as 'weekly' | 'monthly');
        setInitialValues?.({ amount: data.amount.toString(), period: data.period as 'weekly' | 'monthly' });
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    onChanges?.({ amount: value, period });
  };

  const handlePeriodChange = (newPeriod: 'weekly' | 'monthly') => {
    setPeriod(newPeriod);
    onChanges?.({ amount, period: newPeriod });
  };

  return (
    <View className="mb-20">
      <Text className="font-heading-serif text-display-small text-primary-Black mb-2">Matbudsjett</Text>
      <Text className="text-text-secondary text-body-large mb-6">
        Sett ditt ukentlige eller månedlige matbudsjett
      </Text>
      
      <View className="bg-background-secondary rounded-2xl p-4">
        <View className="flex-row items-center mb-4">
          <TextInput
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="Beløp"
            keyboardType="numeric"
            className="flex-1 px-6 py-3 bg-white rounded-l-full"
          />
          <Text className="text-text-secondary text-body-medium mx-2">kr</Text>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handlePeriodChange('weekly')}
            className={`flex-1 px-4 py-2 rounded-full ${
              period === 'weekly' ? 'bg-primary-Green' : 'bg-gray-200'
            }`}
          >
            <Text className={`text-center text-body-large font-heading-medium ${
              period === 'weekly' ? 'text-white' : 'text-gray-700'
            }`}>
              Ukentlig
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handlePeriodChange('monthly')}
            className={`flex-1 px-4 py-2 rounded-full ${
              period === 'monthly' ? 'bg-primary-Green' : 'bg-gray-200'
            }`}
          >
            <Text className={`text-center text-body-large font-heading-medium ${
              period === 'monthly' ? 'text-white' : 'text-gray-700'
            }`}>
              Månedlig
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 