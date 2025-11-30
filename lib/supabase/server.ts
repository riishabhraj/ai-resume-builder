import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Validates if Supabase is properly configured for server-side operations
 */
const isConfigured = 
  supabaseUrl.length > 0 && 
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 0 &&
  supabaseAnonKey.startsWith('eyJ');

/**
 * Creates a Supabase client for server-side operations with cookie-based session management
 * Use this in Server Components, Server Actions, and Route Handlers
 */
export async function createClient() {
  if (!isConfigured) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Supabase admin client for server-side operations with elevated permissions
 * Requires service role key with elevated permissions
 * Returns null if not properly configured
 * 
 * Use this ONLY for operations that require bypassing RLS (Row Level Security)
 * Note: Admin client doesn't use SSR helpers as it doesn't need session management
 */
export const supabaseAdmin = 
  isConfigured && 
  supabaseServiceKey.length > 0 &&
  supabaseServiceKey.startsWith('eyJ')
    ? createSupabaseClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;