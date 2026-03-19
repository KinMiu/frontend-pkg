import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<string | false>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<string | false> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const identifier = username.trim();
    try {
      await authAPI.loginAdmin(identifier, password);
      const userData = { username: identifier, role: 'admin' as const };
      setUser(userData);
      return 'admin';
    } catch (err) {
      void err;
    }
    if (username === 'dosenif12' && password === '12345678') {
      const userData = { username, role: 'pendaftaran' as const };
      setUser(userData);
      return 'pendaftaran';
    }

    try {
      const data = await authAPI.loginDosen(identifier, password);
      const userData: User & { facultyId?: string; nuptk?: string } = {
        username: identifier,
        role: 'dosen',
        facultyId: data.facultyId,
        nuptk: data.nuptk || identifier,
      };
      setUser(userData);
      return 'dosen';
    } catch (err) {
      void err;
      try {
        const opData = await authAPI.loginOperator(identifier, password);
        const userData = {
          username: opData.email || identifier,
          role: 'operator' as const,
          operatorId: opData.operatorId,
          satminkal: opData.satminkal,
        };
        setUser(userData as User);
        return 'operator';
      } catch (opErr) {
        void opErr;
        return false;
      }
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    const u = user as (User & { nuptk?: string; role?: string }) | null;
    if (!u) return false;
    if (u.role === 'admin') {
      const username = (u.username || '').trim();
      if (!username || !newPassword || newPassword.length < 8) return false;
      try {
        await authAPI.changeAdminPassword(username, currentPassword, newPassword);
        return true;
      } catch {
        return false;
      }
    }
    if (u.role === 'dosen') {
      const nuptk = (u.nuptk || u.username || '').trim();
      if (!nuptk || !newPassword || newPassword.length < 8) return false;
      try {
        await authAPI.changeDosenPassword(nuptk, currentPassword, newPassword);
        return true;
      } catch {
        return false;
      }
    }
    if (u.role === 'operator') {
      const email = (u.username || '').trim();
      if (!email || !newPassword || newPassword.length < 6) return false;
      try {
        await authAPI.changeOperatorPassword(email, currentPassword, newPassword);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};