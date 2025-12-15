/**
 * @fileoverview Authentication context provider for managing user authentication state.
 * Provides authentication state and methods throughout the application.
 * @module context/AuthContext
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth.service';

/**
 * @typedef {Object} User
 * @property {string} id - User's unique identifier
 * @property {string} username - User's username
 * @property {string} [name] - User's display name
 * @property {string} email - User's email address
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User|null} user - Current authenticated user or null
 * @property {function(User, string, string): void} login - Set user after login
 * @property {function(User, string, string): void} register - Set user after registration
 * @property {function(): void} logout - Clear user session
 * @property {boolean} isAuthenticated - Whether user is currently authenticated
 * @property {boolean} loading - Whether auth state is being loaded
 */

/**
 * React context for authentication state.
 * @type {React.Context<AuthContextValue|null>}
 */
const AuthContext = createContext(null);

/**
 * Authentication provider component.
 * Manages user authentication state and provides auth methods to children.
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component wrapping children
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    console.log('[AuthProvider] currentUser', currentUser, 'isAuth?', authService.isAuthenticated());
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    setUser(userData);
  };

  const register = (userData, accessToken, refreshToken) => {
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context.
 * Must be used within an AuthProvider component.
 * @returns {AuthContextValue} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 * @example
 * const { user, isAuthenticated, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
