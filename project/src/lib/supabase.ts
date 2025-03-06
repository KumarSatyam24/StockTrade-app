import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-v2'
    }
  },
  db: {
    schema: 'public'
  }
});

// Test the connection and log detailed error information
async function testConnection() {
  try {
    const { data, error } = await supabase.from('stocks').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return;
    }
    
    console.log('Successfully connected to Supabase');
    console.log('Connection test result:', data);
  } catch (error) {
    console.error('Supabase connection error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      url: supabaseUrl
    });
  }
}

// Run the connection test
testConnection();