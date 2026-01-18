/**
 * @fileoverview Private layout wrapper for authenticated routes.
 * Redirects unauthenticated users to login page.
 * @module components/Layout/PrivateLayout
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MainLayout from './MainLayout';

/**
 * Private layout component for protected routes.
 * Checks authentication and redirects to login if needed.
 * Uses React Router's Outlet for nested route rendering.
 * @component
 * @returns {JSX.Element|null} MainLayout with Outlet, Navigate redirect, or null during loading
 */
const PrivateLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default PrivateLayout;
