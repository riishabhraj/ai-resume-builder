import { createClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Get the current user session on the server
 * Use this in Server Components, Server Actions, and Route Handlers
 */
export async function getServerSession(): Promise<{
  user: User | null;
  session: any | null;
}> {
  const client = await createClient();
  
  if (!client) {
    return { user: null, session: null };
  }

  try {
    // getUser() only returns user, not session
    // We need to call getSession() to get the session
    const [
      { data: { user } },
      { data: { session } }
    ] = await Promise.all([
      client.auth.getUser(),
      client.auth.getSession()
    ]);

    return { user, session };
  } catch (error) {
    console.error('Error getting server session:', error);
    return { user: null, session: null };
  }
}

/**
 * Get the current user on the client
 * Use this in Client Components
 */
export async function getClientSession(): Promise<{
  user: User | null;
  session: any | null;
}> {
  if (!supabase) {
    return { user: null, session: null };
  }

  try {
    // getUser() only returns user, not session
    // We need to call getSession() to get the session
    const [
      { data: { user } },
      { data: { session } }
    ] = await Promise.all([
      supabase.auth.getUser(),
      supabase.auth.getSession()
    ]);

    return { user, session };
  } catch (error) {
    console.error('Error getting client session:', error);
    return { user: null, session: null };
  }
}

/**
 * Check if user is authenticated on the server
 */
export async function isAuthenticated(): Promise<boolean> {
  const { user } = await getServerSession();
  return user !== null;
}

/**
 * Get user ID on the server
 */
export async function getUserId(): Promise<string | null> {
  const { user } = await getServerSession();
  return user?.id || null;
}
