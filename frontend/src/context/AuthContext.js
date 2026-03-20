import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('tt_token');
    if (token) {
      getMe()
        .then((res) => {
          setUser(res.data.user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('tt_token');
          localStorage.removeItem('tt_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('tt_token', token);
    localStorage.setItem('tt_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('tt_token');
    localStorage.removeItem('tt_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('tt_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
