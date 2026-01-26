import { create } from 'zustand';
import type { SubscriptionTier, SubscriptionStatus } from '@/lib/razorpay';

interface SubscriptionTransaction {
  id: string;
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  amount: number;
  currency: string;
  status: string;
  plan_type: string;
  created_at: string;
}

interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string | null;
  endDate: string | null;
  cancelAtPeriodEnd: boolean;
  resumesCreated: number;
  reviewsUsed: number;
  transactions: SubscriptionTransaction[];
  loading: boolean;
  initialized: boolean;
  error: string | null;

  // Actions
  fetchSubscription: () => Promise<void>;
  cancelSubscription: () => Promise<{ success: boolean; message: string; endDate?: string }>;
  reactivateSubscription: () => Promise<{ success: boolean; message: string }>;
  reset: () => void;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  tier: 'free',
  status: 'inactive',
  startDate: null,
  endDate: null,
  cancelAtPeriodEnd: false,
  resumesCreated: 0,
  reviewsUsed: 0,
  transactions: [],
  loading: false,
  initialized: false,
  error: null,

  fetchSubscription: async () => {
    if (get().loading) return;

    set({ loading: true, error: null });

    try {
      const response = await fetch('/api/subscription/status');

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();

      set({
        tier: data.subscription?.tier || 'free',
        status: data.subscription?.status || 'inactive',
        startDate: data.subscription?.startDate || null,
        endDate: data.subscription?.endDate || null,
        cancelAtPeriodEnd: data.subscription?.cancelAtPeriodEnd || false,
        resumesCreated: data.usage?.resumesCreated || 0,
        reviewsUsed: data.usage?.reviewsUsed || 0,
        transactions: data.transactions || [],
        loading: false,
        initialized: true,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      set({ 
        loading: false, 
        initialized: true,
        error: error instanceof Error ? error.message : 'Failed to load subscription'
      });
    }
  },

  cancelSubscription: async () => {
    // Prevent concurrent calls
    if (get().loading) {
      return { success: false, message: 'Another operation is in progress' };
    }

    set({ loading: true, error: null });

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      let data;
      try {
        data = await response.json();
      } catch {
        // Fallback if response is not JSON
        const text = await response.text();
        data = { error: text || 'Failed to parse response' };
      }

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to cancel subscription';
        set({ error: errorMessage });
        return { success: false, message: errorMessage };
      }

      // Update local state
      set({ cancelAtPeriodEnd: true, error: null });

      return {
        success: true,
        message: data.message,
        endDate: data.endDate,
      };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
      set({ error: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  reactivateSubscription: async () => {
    // Prevent concurrent calls
    if (get().loading) {
      return { success: false, message: 'Another operation is in progress' };
    }

    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
      });

      let data;
      try {
        data = await response.json();
      } catch {
        // Fallback if response is not JSON
        const text = await response.text();
        data = { error: text || 'Failed to parse response' };
      }

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to reactivate subscription';
        set({ error: errorMessage });
        return { success: false, message: errorMessage };
      }

      // Update local state only on success
      set({ cancelAtPeriodEnd: false, error: null });

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reactivate subscription';
      set({ error: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  reset: () => {
    set({
      tier: 'free',
      status: 'inactive',
      startDate: null,
      endDate: null,
      cancelAtPeriodEnd: false,
      resumesCreated: 0,
      reviewsUsed: 0,
      transactions: [],
      loading: false,
      initialized: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
