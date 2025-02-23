import React from 'react';
import { View, ScrollView } from 'react-native';
import Shimmer from './Shimmer';
import DietaryRequirementsSkeleton from './DietaryRequirementsSkeleton';
import AllergiesSkeleton from './AllergiesSkeleton';
import FoodPreferencesSkeleton from './FoodPreferencesSkeleton';
import BudgetSettingsSkeleton from './BudgetSettingsSkeleton';
import PortionSettingsSkeleton from './PortionSettingsSkeleton';

export default function ProfileSkeleton() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 py-8">
        {/* Header */}
        <Shimmer className="h-10 w-40 mb-4" />

        {/* Profile Card */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          {/* Profile Header */}
          <View className="flex-row items-center mb-6">
            <Shimmer className="w-16 h-16 rounded-full" />
            <View className="ml-4">
              <Shimmer className="h-7 w-40 mb-2" />
              <Shimmer className="h-5 w-48" />
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap -mx-2">
            {/* Weight Card */}
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-gray-50 p-4 rounded-xl">
                <View className="flex-row items-center mb-2">
                  <Shimmer className="w-6 h-6 rounded-full" />
                  <Shimmer className="h-5 w-16 ml-2" />
                </View>
                <Shimmer className="h-7 w-20" />
              </View>
            </View>

            {/* Height Card */}
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-gray-50 p-4 rounded-xl">
                <View className="flex-row items-center mb-2">
                  <Shimmer className="w-6 h-6 rounded-full" />
                  <Shimmer className="h-5 w-16 ml-2" />
                </View>
                <Shimmer className="h-7 w-20" />
              </View>
            </View>

            {/* Age Card */}
            <View className="w-1/2 px-2">
              <View className="bg-gray-50 p-4 rounded-xl">
                <View className="flex-row items-center mb-2">
                  <Shimmer className="w-6 h-6 rounded-full" />
                  <Shimmer className="h-5 w-16 ml-2" />
                </View>
                <Shimmer className="h-7 w-20" />
              </View>
            </View>
          </View>
        </View>

        {/* Edit Profile Button */}
        <Shimmer className="h-14 rounded-full mb-6" />

        {/* Preferences Sections */}
        <DietaryRequirementsSkeleton />
        <AllergiesSkeleton />
        <FoodPreferencesSkeleton />
        <BudgetSettingsSkeleton />
        <PortionSettingsSkeleton />

        {/* Logout Button */}
        <View className="flex items-center mt-4">
          <Shimmer className="h-14 w-full rounded-full" />
        </View>
      </View>
    </ScrollView>
  );
} 