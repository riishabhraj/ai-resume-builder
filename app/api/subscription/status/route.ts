import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        subscription_tier,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        subscription_cancel_at_period_end,
        resumes_created_this_month,
        reviews_this_month,
        last_usage_reset_date
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch subscription status' },
        { status: 500 }
      );
    }

    // Check if subscription has expired and downgrade if needed
    const endDate = profile?.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    const isExpired = endDate && endDate < new Date() && profile?.subscription_tier !== 'free';

    if (isExpired) {
      // Downgrade to free tier
      await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Update local profile data
      profile.subscription_tier = 'free';
      profile.subscription_status = 'expired';
    }

    // Get recent transactions
    const { data: transactions } = await supabase
      .from('subscription_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      subscription: {
        tier: profile?.subscription_tier || 'free',
        status: profile?.subscription_status || 'inactive',
        startDate: profile?.subscription_start_date,
        endDate: profile?.subscription_end_date,
        cancelAtPeriodEnd: profile?.subscription_cancel_at_period_end || false,
      },
      usage: {
        resumesCreated: profile?.resumes_created_this_month || 0,
        reviewsUsed: profile?.reviews_this_month || 0,
        lastReset: profile?.last_usage_reset_date,
      },
      transactions: transactions || [],
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

