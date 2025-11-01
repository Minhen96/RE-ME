import { createClient } from '@supabase/supabase-js';

// Verify environment variables at runtime
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('[Supabase] Missing SUPABASE_URL environment variable');
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  console.error('[Supabase] Missing SUPABASE_KEY environment variable');
  throw new Error('Missing SUPABASE_KEY environment variable');
}

// Create Supabase client for browser/frontend use
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Server-side client with service role key (use only in API routes/edge functions)
export const getServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.warn('[Supabase] Service role key not found. Using anon key instead.');
    return supabase;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export default supabase;
