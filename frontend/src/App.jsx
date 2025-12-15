/**
 * @fileoverview Main application component with routing configuration.
 * Sets up React Router with public and private routes.
 * @module App
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserDataProvider } from './context/UserDataContext';

import './services/api.interceptor';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import ChannelSearch from './pages/ChannelSearch';
import VideoDetail from './pages/VideoDetail';
import Dashboard from './pages/Dashboard';
import Video from './pages/Video';
import UserHome from './pages/UserHome';
import MyFeedPage from './pages/MyFeedPage';

// Layouts / protection
import PrivateLayout from './components/Layout/PrivateLayout';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * Root application component.
 * Configures authentication providers and routing for the entire application.
 * @component
 * @returns {JSX.Element} The application with routing
 */
function App() {
  return (
    <AuthProvider>
      <UserDataProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<PublicHomeRoute />} />
            <Route path="/login" element={<Auth isRegister={false} />} />
            <Route path="/signup" element={<Auth isRegister={true} />} />
            {/* Rutas privadas */}
            <Route element={<PrivateLayout />}>
              <Route path="/dashboard" element={<UserHome />} />
              <Route path="/feed" element={<MyFeedPage />} />
              <Route path="/home" element={<Dashboard />} />
              <Route path="/video" element={<Video />} />
              <Route
                path="/video/:id"
                element={
                  <ProtectedRoute>
                    <VideoDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="/channels" element={<ChannelSearch />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </UserDataProvider>
    </AuthProvider>
  );

  /**
   * Conditional home route component.
   * Redirects authenticated users to dashboard, shows landing page to guests.
   * @returns {JSX.Element} Navigate redirect or Home component
   */
  function PublicHomeRoute() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Home />;
  }
}

export default App;
