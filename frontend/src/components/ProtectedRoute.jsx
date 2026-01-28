/**
 * @fileoverview Protected route wrapper component.
 * Ensures only authenticated users can access wrapped content.
 * @module components/ProtectedRoute
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected route component for securing individual routes.
 * Redirects unauthenticated users to login with return path.
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Protected content to render
 * @returns {JSX.Element} Children, loading indicator, or redirect
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted route to redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
