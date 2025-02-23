import { View } from 'react-native';
import Shimmer from './Shimmer';

export default function EditProfileFormSkeleton() {
  return (
    <View className="flex-1 justify-end">
      <View className="bg-white rounded-t-3xl p-6 h-5/6">
        <View className="flex-row justify-between items-center mb-8">
          <Shimmer className="h-8 w-48 rounded-lg" />
          <Shimmer className="h-6 w-16 rounded-lg" />
        </View>

        {/* Form Fields */}
        {['name', 'weight', 'height', 'age'].map((field, index) => (
          <View key={field} className="mb-6">
            <Shimmer className="h-5 w-32 rounded-lg mb-2" />
            <Shimmer className="h-14 w-full rounded-2xl" />
          </View>
        ))}

        {/* Save Button */}
        <Shimmer className="h-14 w-full rounded-full mt-4" />
      </View>
    </View>
  );
} 