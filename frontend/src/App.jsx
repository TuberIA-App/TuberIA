import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Importar interceptores
import './services/api.interceptor';

// Páginas
import Home from './pages/Home';
import Auth from './pages/Auth';
import ChannelSearch from './pages/ChannelSearch';
import VideoDetail from './pages/VideoDetail'; // Added

import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute'; // Added

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/channels" element={<ChannelSearch />} />
          <Route 
            path="/videos/:id" 
            element={
              <ProtectedRoute>
                <VideoDetail />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
