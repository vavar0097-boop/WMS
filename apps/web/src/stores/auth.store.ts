import { create } from "zustand";

import {
  authService,
  type AuthUser,
  type LoginPayload,
} from "@/features/auth/services/auth.service";

type AuthStore = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;

  login: (payload: LoginPayload) => Promise<void>;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isCheckingSession: false,
  isLoggingIn: false,
  isLoggingOut: false,

  async login(payload) {
    set({
      isLoggingIn: true,
    });

    try {
      const user = await authService.login(payload);

      set({
        user,
        isAuthenticated: true,
      });
    } finally {
      set({
        isLoggingIn: false,
      });
    }
  },

  async checkSession() {
    set({
      isCheckingSession: true,
    });

    try {
      const user = await authService.me();

      set({
        user,
        isAuthenticated: Boolean(user),
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
      });
    } finally {
      set({
        isCheckingSession: false,
      });
    }
  },

  async logout() {
    set({
      isLoggingOut: true,
    });

    try {
      await authService.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoggingOut: false,
      });
    }
  },
}));