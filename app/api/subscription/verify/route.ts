import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPaymentSignature, getPlanDetails, SubscriptionPlanId } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      planId: SubscriptionPlanId;
    };

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    const plan = getPlanDetails(planId);
    
    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.interval);

    // Update user profile with subscription
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: plan.tier,
        subscription_status: 'active',
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        subscription_cancel_at_period_end: false,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to activate subscription' },
        { status: 500 }
      );
    }

    // Record transaction
    const { error: txError } = await supabase
      .from('subscription_transactions')
      .insert({
        user_id: user.id,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        amount: plan.amount,
        currency: plan.currency,
        status: 'captured',
        plan_type: planId,
      });

    if (txError) {
      console.error('Failed to record transaction:', txError);
      // Don't fail the request, subscription is already active
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      tier: plan.tier,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

