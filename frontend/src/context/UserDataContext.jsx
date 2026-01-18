/**
 * @fileoverview User data context provider for managing user statistics and channel data.
 * Provides cached user data and update methods throughout the application.
 * @module context/UserDataContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import userService from '../services/user.service';

/**
 * @typedef {Object} UserStats
 * @property {number} summariesRead - Number of summaries read by user
 * @property {string} timeSaved - Formatted time saved string (e.g., "2h 30m")
 * @property {number} followedChannels - Number of channels user follows
 */

/**
 * @typedef {Object} UserDataContextValue
 * @property {UserStats} stats - User statistics object
 * @property {number} channelsCount - Number of followed channels
 * @property {boolean} loading - Whether stats are being loaded
 * @property {function(): void} incrementChannelsCount - Increment channel count by 1
 * @property {function(): void} decrementChannelsCount - Decrement channel count by 1
 * @property {function(): Promise<void>} refreshStats - Reload stats from server
 */

/**
 * React context for user data state.
 * @type {React.Context<UserDataContextValue|undefined>}
 */
const UserDataContext = createContext();

/**
 * Custom hook to access user data context.
 * Must be used within a UserDataProvider component.
 * @returns {UserDataContextValue} User data context value
 * @throws {Error} If used outside of UserDataProvider
 * @example
 * const { stats, channelsCount, refreshStats } = useUserData();
 */
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider');
  }
  return context;
};

/**
 * User data provider component.
 * Manages user statistics and channel counts with automatic refresh.
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component wrapping children
 * @example
 * <UserDataProvider>
 *   <Dashboard />
 * </UserDataProvider>
 */
export const UserDataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    summariesRead: 0,
    timeSaved: '0h 0m',
    followedChannels: 0
  });
  const [channelsCount, setChannelsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  /**
   * Loads user statistics from the server.
   * Resets stats to defaults if user is not authenticated.
   * @private
   */
  const loadStats = useCallback(async () => {
    if (!isAuthenticated) {
      setStats({
        summariesRead: 0,
        timeSaved: '0h 0m',
        followedChannels: 0
      });
      setChannelsCount(0);
      return;
    }

    try {
      setLoading(true);
      const data = await userService.getStats();
      setStats(data);
      setChannelsCount(data.followedChannels);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Effect: Load stats on mount and when authentication changes.
   */
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  /**
   * Updates channel count by a given delta.
   * Ensures count never goes below zero.
   * @param {number} delta - Amount to change count by (positive or negative)
   * @private
   */
  const updateChannelsCount = useCallback((delta) => {
    setChannelsCount(prev => Math.max(0, prev + delta));
    setStats(prev => ({
      ...prev,
      followedChannels: Math.max(0, prev.followedChannels + delta)
    }));
  }, []);

  /**
   * Increments channel count by 1 (when user follows a channel).
   */
  const incrementChannelsCount = useCallback(() => {
    updateChannelsCount(1);
  }, [updateChannelsCount]);

  /**
   * Decrements channel count by 1 (when user unfollows a channel).
   */
  const decrementChannelsCount = useCallback(() => {
    updateChannelsCount(-1);
  }, [updateChannelsCount]);

  /**
   * Refreshes stats from server.
   * @returns {Promise<void>}
   */
  const refreshStats = useCallback(() => {
    return loadStats();
  }, [loadStats]);

  const value = {
    stats,
    channelsCount,
    loading,
    incrementChannelsCount,
    decrementChannelsCount,
    refreshStats
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserDataContext;
