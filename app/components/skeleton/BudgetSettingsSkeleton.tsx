import { View } from 'react-native';
import Shimmer from './Shimmer';

export default function BudgetSettingsSkeleton() {
  return (
    <View className="mb-20">
      <Shimmer className="h-8 w-48 rounded-lg mb-2" />
      <Shimmer className="h-6 w-72 rounded-lg mb-6" />
      
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        {/* Amount Input */}
        <View className="mb-6">
          <Shimmer className="h-6 w-32 mb-2" />
          <Shimmer className="h-14 w-full rounded-2xl" />
        </View>

        {/* Period Selection */}
        <View>
          <Shimmer className="h-6 w-32 mb-2" />
          <View className="flex-row gap-4">
            <Shimmer className="h-12 flex-1 rounded-full" />
            <Shimmer className="h-12 flex-1 rounded-full" />
          </View>
        </View>
      </View>
    </View>
  );
} 