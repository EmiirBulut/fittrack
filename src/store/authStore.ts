import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { AuthUser } from '../types/auth';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  user: AuthUser | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  setSession: (session) =>
    set({
      session,
      user: session?.user
        ? { id: session.user.id, email: session.user.email ?? '' }
        : null,
      isLoading: false,
    }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, isLoading: false });
  },
}));
