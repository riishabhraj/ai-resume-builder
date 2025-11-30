import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=configuration`);
    }

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=oauth_failed`);
    }

    if (data.user) {
      // Ensure profile exists for OAuth users
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || 
                      data.user.user_metadata?.name || 
                      data.user.email?.split('@')[0] || 
                      'User',
          },
          { onConflict: 'id' }
        );

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the auth flow if profile creation fails
      }
    }

    // Redirect to the intended destination
    return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
  }

  // If no code, redirect to sign in
  return NextResponse.redirect(`${requestUrl.origin}/sign-in`);
}
