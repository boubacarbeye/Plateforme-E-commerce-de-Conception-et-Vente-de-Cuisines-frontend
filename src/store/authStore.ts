import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'client' | 'admin' | 'commercial';
}

interface AuthState {
  token: string | null;
  user: User | null;
  hasHydrated: boolean; // <-- NOUVEAU
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void; // <-- NOUVEAU
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'dgs-auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true); // Dit au store qu'il a fini de lire la mémoire
      }
    }
  )
);