import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider, RequireAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { MarketProvider } from './contexts/MarketContext';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Portfolio } from './pages/Portfolio';
import { Settings } from './pages/Settings';
import { Wishlist } from './pages/Wishlist';
import { Funds } from './pages/Funds';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MarketProvider>
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
                <Route path="/settings" element={<Settings />} />
                <Route path="/funds" element={<Funds />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </MarketProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}