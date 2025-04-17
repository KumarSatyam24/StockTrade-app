import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-v2'
    }
  },
  db: {
    schema: 'public'
  },
  // Add proper error handling and retries
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Test the connection without blocking
async function testConnection() {
  try {
    // Use a lightweight query to test connection
    const { error } = await supabase
      .from('stocks')
      .select('count', { count: 'exact', head: true })
      .limit(1)
      .single();
    
    if (error) {
      console.warn('Supabase connection warning:', {
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return;
    }
    
    console.log('Successfully connected to Supabase');
  } catch (error) {
    // Log error but don't throw to prevent app from crashing
    console.warn('Supabase connection warning:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      url: supabaseUrl
    });
  }
}

// Run the connection test in the background
testConnection().catch(console.warn);

// Export the initialized client
export default supabase;