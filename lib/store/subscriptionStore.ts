import { create } from 'zustand';
import { 
  Subscription, 
  getSubscriptions, 
  getDefaultSubscription, 
  getUserSubscription, 
  setUserSubscription 
} from '@lib/services/subscriptionService';

interface SubscriptionState {
  // State
  subscriptions: Subscription[];
  currentSubscription: Subscription | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSubscriptions: () => Promise<void>;
  fetchUserSubscription: (userId: string) => Promise<void>;
  setSubscription: (userId: string, subscriptionId: string) => Promise<void>;
  resetState: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Initial state
  subscriptions: [],
  currentSubscription: null,
  isLoading: false,
  error: null,

  // Actions
  fetchSubscriptions: async () => {
    try {
      set({ isLoading: true, error: null });
      const subscriptions = await getSubscriptions();
      set({ subscriptions, isLoading: false });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch subscriptions', 
        isLoading: false 
      });
    }
  },

  fetchUserSubscription: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const subscription = await getUserSubscription(userId);
      
      // If user doesn't have a subscription, try to get the default one
      if (!subscription) {
        const defaultSubscription = await getDefaultSubscription();
        
        // If there's a default subscription, assign it to the user
        if (defaultSubscription) {
          await setUserSubscription(userId, defaultSubscription._id);
          set({ currentSubscription: defaultSubscription, isLoading: false });
        } else {
          set({ currentSubscription: null, isLoading: false });
        }
      } else {
        set({ currentSubscription: subscription, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user subscription', 
        isLoading: false 
      });
    }
  },

  setSubscription: async (userId: string, subscriptionId: string) => {
    try {
      set({ isLoading: true, error: null });
      await setUserSubscription(userId, subscriptionId);
      
      // Find the subscription in the current list
      const subscription = get().subscriptions.find(sub => sub._id === subscriptionId);
      
      if (subscription) {
        set({ currentSubscription: subscription, isLoading: false });
      } else {
        // If not found in the current list, fetch it again
        await get().fetchUserSubscription(userId);
      }
    } catch (error) {
      console.error('Error setting user subscription:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to set user subscription', 
        isLoading: false 
      });
    }
  },

  resetState: () => {
    set({
      currentSubscription: null,
      error: null
    });
  }
})); 