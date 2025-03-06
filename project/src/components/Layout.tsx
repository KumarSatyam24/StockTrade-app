import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BarChart3, Home, LogOut, Settings, Heart, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Layout() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-2 text-gray-900">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold">StockTrade</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="inline-flex items-center px-1 pt-1 text-gray-900">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link to="/portfolio" className="inline-flex items-center px-1 pt-1 text-gray-900">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Portfolio
                </Link>
                <Link to="/wishlist" className="inline-flex items-center px-1 pt-1 text-gray-900">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Link>
                <Link to="/funds" className="inline-flex items-center px-1 pt-1 text-gray-900">
                  <Wallet className="h-4 w-4 mr-2" />
                  Funds
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900"
              >
                <Settings className="h-6 w-6" />
              </button>
              <button
                onClick={handleSignOut}
                className="ml-4 p-2 rounded-full text-gray-500 hover:text-gray-900"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}