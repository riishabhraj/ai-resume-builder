import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRazorpay, RAZORPAY_ENABLED } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    if (!RAZORPAY_ENABLED) {
      return NextResponse.json(
        { error: 'Payment system is not configured' },
        { status: 503 }
      );
    }

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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('razorpay_subscription_id, subscription_tier, subscription_end_date')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (!profile.razorpay_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Cancel subscription in Razorpay (at period end)
    try {
      const razorpay = getRazorpay();
      await razorpay.subscriptions.cancel(profile.razorpay_subscription_id, true);
    } catch (error) {
      console.error('Razorpay cancel error:', error);
      // Continue to update database even if Razorpay fails
    }

    // Update profile to mark subscription as cancelled at period end
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      endDate: profile.subscription_end_date,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

