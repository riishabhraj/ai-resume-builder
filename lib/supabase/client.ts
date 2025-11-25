import { createClient } from '@supabase/supabase-js';

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
 * Supabase client for client-side operations
 * Returns null if not properly configured
 */
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
