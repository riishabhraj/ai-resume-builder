import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      initialized: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),

      initialize: async () => {
        if (get().initialized) return;
        
        set({ loading: true });
        
        try {
          if (!supabase) {
            set({ user: null, session: null, loading: false, initialized: true });
            return;
          }

          // Get initial session
          const {
            data: { user, session },
          } = await supabase.auth.getUser();

          set({ user, session, loading: false, initialized: true });

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              user: session?.user ?? null,
              session: session,
            });
          });
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ user: null, session: null, loading: false, initialized: true });
        }
      },

      signOut: async () => {
        try {
          if (supabase) {
            await supabase.auth.signOut();
          }
          set({ user: null, session: null });
        } catch (error) {
          console.error('Error signing out:', error);
          throw error;
        }
      },

      refreshSession: async () => {
        try {
          if (!supabase) return;

          const {
            data: { user, session },
          } = await supabase.auth.getUser();

          set({ user, session });
        } catch (error) {
          console.error('Error refreshing session:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist user ID, not the full user object
        user: state.user ? { id: state.user.id, email: state.user.email } : null,
      }),
    }
  )
);
