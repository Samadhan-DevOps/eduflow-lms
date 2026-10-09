import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import type { User } from '../types';

interface Ctx { user: User | null; isAuthenticated: boolean; isLoading: boolean; login(u: User, t: string): void; logout(): void; setUser(u: User): void; }
const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ef_token');
    if (!token) { setIsLoading(false); return; }
    authApi.getMe().then(setUserState).catch(() => { localStorage.removeItem('ef_token'); localStorage.removeItem('ef_user'); }).finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((u: User, t: string) => { localStorage.setItem('ef_token', t); localStorage.setItem('ef_user', JSON.stringify(u)); setUserState(u); }, []);
  const logout = useCallback(() => { localStorage.removeItem('ef_token'); localStorage.removeItem('ef_user'); setUserState(null); }, []);
  const setUser = useCallback((u: User) => { setUserState(u); localStorage.setItem('ef_user', JSON.stringify(u)); }, []);

  return <AuthCtx.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, setUser }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => { const c = useContext(AuthCtx); if (!c) throw new Error('useAuth outside AuthProvider'); return c; };
