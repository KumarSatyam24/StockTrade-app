import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, LineChart, BarChart, PieChart } from 'lucide-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Get the current site URL for redirect
  const siteUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-full shadow-lg">
            <TrendingUp className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to StockTrade
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w">
          Your personal stock trading platform
        </p>
      </div>

      {/* Features Section */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="grid grid-cols-3 gap-4 px-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <LineChart className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <h3 className="text-sm font-medium text-gray-900">Real-time Tracking</h3>
            <p className="text-xs text-gray-500">Monitor market movements live</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <BarChart className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <h3 className="text-sm font-medium text-gray-900">Portfolio Analysis</h3>
            <p className="text-xs text-gray-500">Track your investments</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <PieChart className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <h3 className="text-sm font-medium text-gray-900">Smart Insights</h3>
            <p className="text-xs text-gray-500">Make informed decisions</p>
          </div>
        </div>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
              className: {
                container: 'w-full space-y-4',
                button: 'w-full flex justify-center py-2.5 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                divider: 'my-6',
                label: 'block text-sm font-medium text-gray-700 mb-1',
                input: 'appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                message: 'mt-1 text-sm text-red-600',
                anchor: 'font-medium text-blue-600 hover:text-blue-500',
              },
            }}
            providers={['google']}
            redirectTo={siteUrl}
            socialLayout="vertical"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                  button_label: 'Sign in',
                  social_provider_text: "Continue with Google",
                  link_text: "Already have an account? Sign in"
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                  button_label: 'Sign up',
                  social_provider_text: "Sign up with Google",
                  link_text: "Don't have an account? Sign up"
                }
              }
            }}
            onlyThirdPartyProviders={false}
          />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Protected by industry-standard security
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}