import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Validates if Supabase is properly configured for client-side operations
 */
const isConfigured = 
  supabaseUrl.length > 0 && 
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 0 &&
  supabaseAnonKey.startsWith('eyJ');

/**
 * Supabase client for client-side operations using SSR helpers
 * Returns null if not properly configured
 */
export const supabase = isConfigured
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;