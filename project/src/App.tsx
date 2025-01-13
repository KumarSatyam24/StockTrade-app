import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider, RequireAuth } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Portfolio } from './pages/Portfolio';
import { Settings } from './pages/Settings';
import { Wishlist } from './pages/Wishlist';
import { Analytics } from './pages/Analytics';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}