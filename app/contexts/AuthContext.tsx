'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  permissions?: {
    permission: string;
    isActive: boolean;
  }[];
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          // Don't immediately refresh on mount to avoid double login
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array - only run on mount

  useEffect(() => {
    // Set up focus and interval listeners only after user is set
    if (!user) return;

    // Soft refresh on focus - only if user is already authenticated
    const onFocus = () => {
      refreshUser().catch(() => {});
    };
    window.addEventListener('focus', onFocus);
    
    // Periodic refresh every 10 minutes to propagate permission changes (reduced frequency)
    const interval = window.setInterval(() => {
      refreshUser().catch(() => {});
    }, 600000); // 10 dakika = 600000ms
    
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [user?.id]); // Only depend on user ID, not the entire user object

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('isAdmin', 'true');
        
        // State'i güncelle ve kısa bir delay ekle
        setUser(data.user);
        
        // State güncellemesinin tamamlanması için kısa bir bekleme
        await new Promise(resolve => setTimeout(resolve, 100));

        // Log activity (optional, don't block login if it fails)
        fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            action: 'LOGIN',
            entityType: 'SYSTEM',
            description: `${data.user.name || data.user.username} giriş yaptı`,
            ipAddress: '127.0.0.1'
          })
        }).catch(console.error);

        return true;
      } else {
        throw new Error(data.error || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };


  const logout = () => {
    // Log activity before logout
    if (user) {
      fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'LOGOUT',
          entityType: 'SYSTEM',
          description: `${user.name} çıkış yaptı`,
          ipAddress: '127.0.0.1'
        })
      }).catch(console.error);
    }

    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAdmin');
    sessionStorage.clear();
    setUser(null);
    router.push('/admin-login');
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch (e) {
      console.error('Token refresh error:', e);
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        // Token expired, try to refresh
        const refreshed = await refreshToken();
        if (!refreshed) {
          // Refresh failed; do not force logout on page reload
          // Keep current local session to avoid redirect loop, let next actions re-auth if needed
          return;
        }
        // Retry with new token
        const newToken = localStorage.getItem('token');
        const retryRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        if (!retryRes.ok) return;
        const fresh = await retryRes.json();
        localStorage.setItem('user', JSON.stringify(fresh));
        setUser(fresh);
        return;
      }
      
      const fresh = await res.json();
      
      // Sadece gerçekten değişiklik varsa state'i güncelle
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const currentUserData = JSON.parse(currentUser);
        const hasChanges = JSON.stringify(currentUserData) !== JSON.stringify(fresh);
        if (hasChanges) {
          localStorage.setItem('user', JSON.stringify(fresh));
          setUser(fresh);
        }
      } else {
        localStorage.setItem('user', JSON.stringify(fresh));
        setUser(fresh);
      }
    } catch (e) {
      // ignore
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = typeof window !== 'undefined' ? localStorage.getItem('isAdmin') === 'true' : false;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isAuthenticated,
      isAdmin,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
