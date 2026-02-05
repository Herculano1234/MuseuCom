import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface AuthContextValue {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function init() {
      const token = localStorage.getItem('museucom-token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const resp = await api.get('/me');
        if (!mounted) return;
        setUser(resp.data || null);
        localStorage.setItem('museucom-auth', 'true');
      } catch (err) {
        // token inválido -> limpar
        localStorage.removeItem('museucom-token');
        localStorage.removeItem('museucom-refresh');
        localStorage.removeItem('museucom-user');
        localStorage.removeItem('museucom-auth');
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    const resp = await api.post('/auth/login', { email, password });
    const { token, refreshToken, ...u } = resp.data || {};
    if (token) localStorage.setItem('museucom-token', token);
    if (refreshToken) localStorage.setItem('museucom-refresh', refreshToken);
    localStorage.setItem('museucom-auth', 'true');
    localStorage.setItem('museucom-user', JSON.stringify(u));
    setUser(u);
    navigate('/dashboard');
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('museucom-refresh');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }).catch(() => {});
      }
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('museucom-token');
      localStorage.removeItem('museucom-refresh');
      localStorage.removeItem('museucom-user');
      localStorage.removeItem('museucom-auth');
      localStorage.removeItem('museucom-perfil');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
