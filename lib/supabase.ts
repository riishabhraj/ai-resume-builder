import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if Supabase is properly configured
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'placeholder' && 
  supabaseUrl.startsWith('http') &&
  (supabaseKey && supabaseKey !== 'placeholder');

// Only create client if properly configured, otherwise null
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Server-side client with service role key (for admin operations)
export const supabaseAdmin = isSupabaseConfigured && supabaseServiceKey && supabaseServiceKey !== 'placeholder'
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export const hasSupabase = !!supabase;

