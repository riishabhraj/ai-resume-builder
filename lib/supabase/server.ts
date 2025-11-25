import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Validates if Supabase is properly configured for server-side operations
 */
const isConfigured = 
  supabaseUrl.length > 0 && 
  supabaseUrl.startsWith('http') &&
  supabaseServiceKey.length > 0 &&
  supabaseServiceKey.startsWith('eyJ');

/**
 * Supabase admin client for server-side operations
 * Requires service role key with elevated permissions
 * Returns null if not properly configured
 */
export const supabaseAdmin = isConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
