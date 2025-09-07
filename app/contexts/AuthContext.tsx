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
  adminLogin: (password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
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
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

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
        localStorage.setItem('isAdmin', 'false');
        setUser(data.user);

        // Log activity
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            action: 'LOGIN',
            entityType: 'SYSTEM',
            description: `${data.user.name} giriş yaptı`,
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

  const adminLogin = async (password: string): Promise<boolean> => {
    try {
      // Admin kullanıcısı ile normal login yap
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Admin login - User data received:', data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAdmin', 'true');
        setUser(data.user);

        // Log activity
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            action: 'LOGIN',
            entityType: 'SYSTEM',
            description: `${data.user.name} admin girişi yaptı`,
            ipAddress: '127.0.0.1'
          })
        }).catch(console.error);

        return true;
      } else {
        throw new Error(data.error || 'Admin girişi başarısız');
      }
    } catch (error) {
      console.error('Admin login error:', error);
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
    localStorage.removeItem('isAdmin');
    sessionStorage.clear();
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !!user;
  const isAdmin = typeof window !== 'undefined' ? localStorage.getItem('isAdmin') === 'true' : false;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      adminLogin,
      logout,
      loading,
      isAuthenticated,
      isAdmin
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
