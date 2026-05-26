"use client";

import { create } from "zustand";
import { authApi, setApiTokenProvider } from "@/lib/api";
import type { UserDto } from "@/types/dto";

const TOKEN_KEY = "ssot.accessToken";

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  accessToken: string | null;
  currentUser: UserDto | null;
  isAuthenticated: boolean;
  restoreToken: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const setStoredToken = (token: string | null): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
};

export const useAuthStore = create<AuthState>((set, get) => {
  setApiTokenProvider(() => get().accessToken);

  return {
    accessToken: null,
    currentUser: null,
    isAuthenticated: false,

    restoreToken: async () => {
      if (typeof window === "undefined") {
        return;
      }

      const token = window.localStorage.getItem(TOKEN_KEY);
      if (!token) {
        return;
      }

      set({ accessToken: token, isAuthenticated: true });

      try {
        const user = await authApi.me();
        set({ currentUser: user, isAuthenticated: Boolean(user) });
      } catch {
        setStoredToken(null);
        set({ accessToken: null, currentUser: null, isAuthenticated: false });
      }
    },

    login: async (email: string, password: string) => {
      const result = await authApi.login({ email, password });
      setStoredToken(result.token);
      set({ accessToken: result.token, currentUser: result.user, isAuthenticated: true });
    },

    register: async (payload: RegisterPayload) => {
      const result = await authApi.register(payload);
      setStoredToken(result.token);
      set({ accessToken: result.token, currentUser: result.user, isAuthenticated: true });
    },

    logout: () => {
      setStoredToken(null);
      set({ accessToken: null, currentUser: null, isAuthenticated: false });
    }
  };
});