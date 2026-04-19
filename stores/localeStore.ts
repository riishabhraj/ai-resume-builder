import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'INR' | 'USD';

interface LocaleState {
  currency: Currency;
  detectedCountry: string | null;
  isManualOverride: boolean;
  initialized: boolean;

  // Actions
  setCurrency: (currency: Currency, isManual?: boolean) => void;
  detectAndSetCurrency: () => Promise<void>;
  reset: () => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      detectedCountry: null,
      isManualOverride: false,
      initialized: false,

      setCurrency: (currency: Currency, isManual = false) => {
        set({
          currency,
          isManualOverride: isManual,
        });
      },

      detectAndSetCurrency: async () => {
        // If already manually overridden, don't auto-detect
        if (get().isManualOverride) {
          set({ initialized: true });
          return;
        }

        try {
          const response = await fetch('/api/locale/detect');
          if (response.ok) {
            const data = await response.json();
            set({
              currency: data.currency as Currency,
              detectedCountry: data.country,
              initialized: true,
            });
          } else {
            // Fallback to USD on error
            set({
              currency: 'USD',
              detectedCountry: null,
              initialized: true,
            });
          }
        } catch (error) {
          console.error('Failed to detect locale:', error);
          // Fallback to USD on error
          set({
            currency: 'USD',
            detectedCountry: null,
            initialized: true,
          });
        }
      },

      reset: () => {
        set({
          currency: 'USD',
          detectedCountry: null,
          isManualOverride: false,
          initialized: false,
        });
      },
    }),
    {
      name: 'locale-storage',
      partialize: (state) => ({
        currency: state.currency,
        isManualOverride: state.isManualOverride,
      }),
    }
  )
);
