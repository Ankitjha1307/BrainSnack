"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { authApi, ApiError, getStoredToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  /** True when there is a usable session. */
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Re-read the profile so XP/level/streak update after a quiz. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // `true` until we have decided whether the stored token is still valid.
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await authApi.me());
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // The token lives in localStorage, so the session has to be rehydrated from
    // /auth/me on boot. The old provider only checked that a token existed,
    // leaving `user` null after every refresh - the navbar went blank and the
    // dashboard fell back to hardcoded stats.
    let cancelled = false;

    const bootstrap = async () => {
      if (!getStoredToken()) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch (error) {
        // An expired or rejected token must be discarded, otherwise every
        // subsequent request 401s forever.
        if (error instanceof ApiError && (error.status === 401 || error.status === 0)) {
          authApi.logout();
        }
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await authApi.login({ email, password }));
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setUser(await authApi.register({ username, email, password }));
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

/** Redirects to /login when there is no session. Used by the dashboard layout. */
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace("/login");
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  return auth;
}