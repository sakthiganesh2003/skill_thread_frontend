import { create } from 'zustand';
import { authAPI } from './api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.login(email, password);
      localStorage.setItem('silkthread_token', data.token);
      localStorage.setItem('silkthread_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (name: string, email: string, password: string, phone?: string) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.register({ name, email, password, phone });
      localStorage.setItem('silkthread_token', data.token);
      localStorage.setItem('silkthread_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('silkthread_token');
    localStorage.removeItem('silkthread_user');
    set({ user: null, token: null });
  },

  hydrate: async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('silkthread_token');
      const user = localStorage.getItem('silkthread_user');
      if (token && user) {
        set({ token, user: JSON.parse(user) });
      }
    }
  },
}));
