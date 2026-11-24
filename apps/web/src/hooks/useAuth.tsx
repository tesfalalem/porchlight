import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AuthLoginResponse } from '@porchlight/shared';
import { getStoredToken, setStoredToken } from '../lib/apiClient';
import { loginAdmin } from '../services/authApi';

interface AuthState {
  token: string | null;
  admin: AuthLoginResponse['admin'] | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateAdmin: (admin: AuthLoginResponse['admin'], token?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_KEY = 'porchlight_admin_user';

function loadAdmin(): AuthLoginResponse['admin'] | null {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? (JSON.parse(raw) as AuthLoginResponse['admin']) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    token: getStoredToken(),
    admin: loadAdmin(),
  }));

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginAdmin(email, password);
    setStoredToken(res.token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin));
    setState({ token: res.token, admin: res.admin });
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    localStorage.removeItem(ADMIN_KEY);
    setState({ token: null, admin: null });
  }, []);

  const updateAdmin = useCallback((admin: AuthLoginResponse['admin'], token?: string) => {
    if (token) {
      setStoredToken(token);
    }
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    setState((prev) => ({
      token: token ?? prev.token,
      admin,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.token),
      login,
      logout,
      updateAdmin,
    }),
    [state, login, logout, updateAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
