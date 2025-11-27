import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import './services/api.interceptor';

// Páginas
import Home from './pages/Home';
import Auth from './pages/Auth';
import ChannelSearch from './pages/ChannelSearch';
import Dashboard from './pages/Dashboard';
import Video from './pages/Video';


import PrivateLayout from './components/Layout/PrivateLayout';
import UserHome from './pages/UserHome';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />          
          <Route path="/login" element={<Auth />} />

          {/* Rutas privadas */}
          <Route element={<PrivateLayout />}>
            <Route path="/dashboard" element={<UserHome />} />
            <Route path="/home" element={<Dashboard />} />     
            <Route path="/video" element={<Video />} />
            <Route path="/channels" element={<ChannelSearch />} />
          </Route>


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
