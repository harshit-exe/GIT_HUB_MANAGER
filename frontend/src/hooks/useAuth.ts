import { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('github_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await authApi.verifyToken();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('github_token');
      localStorage.removeItem('github_user');
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    authApi.loginWithGitHub();
  };

  const logout = () => {
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleAuthSuccess = (token: string, userData: User) => {
    localStorage.setItem('github_token', token);
    localStorage.setItem('github_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    handleAuthSuccess,
  };
}