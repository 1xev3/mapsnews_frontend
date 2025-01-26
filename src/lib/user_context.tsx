"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/ApiTypes';
import api from '@/lib/api';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get user data on mount
    console.log("Getting user data")

    api.getCurrentUser()
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      throw error; // Forward error
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 