'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'donor' | 'patient' | 'admin';
  bloodType?: string;
  phone?: string;
  address?: string;
  lastDonationDate?: string;
  medicalHistory?: string;
  donorInfo?: {
    bloodType: string;
    lastDonationDate?: string;
    totalDonations: number;
    isDonationEligible: boolean;
    nextEligibleDate?: string;
  };
  patientInfo?: {
    bloodType: string;
    medicalCondition: string;
    hospitalName: string;
    doctorName: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Registration failed');
      }

      const responseData = await response.json();
      setToken(responseData.token);
      setUser(responseData.user);

      localStorage.setItem('authToken', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
