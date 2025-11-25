import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Validates if Supabase configuration is properly set up
 * Checks for presence of URL and key, and validates URL format
 */
const isSupabaseConfigured = 
  supabaseUrl.length > 0 && 
  supabaseUrl.startsWith('http') &&
  supabaseKey.length > 0 &&
  supabaseKey.startsWith('eyJ'); // JWT tokens start with eyJ

/**
 * Supabase client for client-side operations
 * Returns null if credentials are not properly configured
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Supabase admin client with elevated permissions
 * Used for server-side operations that require service role access
 */
export const supabaseAdmin = 
  isSupabaseConfigured && 
  supabaseServiceKey.length > 0 &&
  supabaseServiceKey.startsWith('eyJ')
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

/**
 * Flag indicating whether Supabase is available
 * Use this to conditionally enable features that depend on Supabase
 */
export const hasSupabase = !!supabase;

