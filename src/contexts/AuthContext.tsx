import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User, UserPermissions, ROLE_PERMISSIONS } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  permissions: UserPermissions | null;
  hasPermission: (permission: keyof UserPermissions) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      const userData = response.data.user;
      setUser(userData);
      // Admin a toujours tous les accès
      if (userData.role === 'admin') {
        setPermissions(ROLE_PERMISSIONS.admin);
      } else {
        // Utiliser les permissions personnalisées ou celles par défaut du rôle
        setPermissions(userData.permissions || ROLE_PERMISSIONS[userData.role] || null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      if (userData.role === 'admin') {
        setPermissions(ROLE_PERMISSIONS.admin);
      } else {
        setPermissions(userData.permissions || ROLE_PERMISSIONS[userData.role] || null);
      }
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (username: string, email: string, password: string, role = 'manager') => {
    try {
      const response = await axios.post('/auth/register', { username, email, password, role });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      if (userData.role === 'admin') {
        setPermissions(ROLE_PERMISSIONS.admin);
      } else {
        setPermissions(userData.permissions || ROLE_PERMISSIONS[userData.role] || null);
      }
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPermissions(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (user?.role === 'admin') return true;
    return permissions ? permissions[permission] : false;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, permissions, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};