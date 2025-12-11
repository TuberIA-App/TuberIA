// src/context/UserDataContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import userService from '../services/user.service';

const UserDataContext = createContext();

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider');
  }
  return context;
};

export const UserDataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    summariesRead: 0,
    timeSaved: '0h 0m',
    followedChannels: 0
  });
  const [channelsCount, setChannelsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load stats when user is authenticated
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

  // Load stats on mount and when auth changes
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Increment/decrement channels count
  const updateChannelsCount = useCallback((delta) => {
    setChannelsCount(prev => Math.max(0, prev + delta));
    setStats(prev => ({
      ...prev,
      followedChannels: Math.max(0, prev.followedChannels + delta)
    }));
  }, []);

  // Increment channels count (when following)
  const incrementChannelsCount = useCallback(() => {
    updateChannelsCount(1);
  }, [updateChannelsCount]);

  // Decrement channels count (when unfollowing)
  const decrementChannelsCount = useCallback(() => {
    updateChannelsCount(-1);
  }, [updateChannelsCount]);

  // Refresh stats from server
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
