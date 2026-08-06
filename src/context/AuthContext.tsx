import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User, UserRole } from '../types';
import { getStoredAuth, mockApi } from '../lib/mockApi';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (data: {
    email: string;
    password: string;
    name: string;
    role: 'seeker' | 'hirer';
    phone?: string;
    companyName?: string;
  }) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth) {
      setUser(auth.user);
      mockApi
        .me()
        .then((res) => setUser(res.user))
        .catch(() => {
          mockApi.logout();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await mockApi.login(email, password);
    setUser(res.user);
    return res.user;
  }, []);

  const signup = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      role: 'seeker' | 'hirer';
      phone?: string;
      companyName?: string;
    }) => {
      const res = await mockApi.signup(data);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(() => {
    mockApi.logout();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const res = await mockApi.me();
    setUser(res.user);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refresh, setUser }),
    [user, loading, login, signup, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function dashboardPath(role: UserRole): string {
  if (role === 'admin') return '/admin';
  if (role === 'hirer') return '/hirer';
  return '/seeker';
}
