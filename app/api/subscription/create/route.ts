import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRazorpay, RAZORPAY_ENABLED, getPlanDetails, SubscriptionPlanId, SUBSCRIPTION_PLANS } from '@/lib/razorpay';

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

    const body = await request.json();
    const { planId } = body as { planId: SubscriptionPlanId };

    if (!planId || !(planId in SUBSCRIPTION_PLANS)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const plan = getPlanDetails(planId);

    // Get or create profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('razorpay_customer_id, email, full_name')
      .eq('id', user.id)
      .single();

    let customerId = profile?.razorpay_customer_id;

    // Create Razorpay customer if doesn't exist
    if (!customerId) {
      try {
        const razorpay = getRazorpay();
        const customerEmail = profile?.email || user.email || '';
        
        // Try to create customer, or fetch if already exists
        try {
          const customer = await razorpay.customers.create({
            name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: customerEmail,
            contact: user.user_metadata?.phone || '',
          });

          customerId = customer.id;
        } catch (createError: any) {
          // If customer already exists, try to find them
          if (createError.statusCode === 400 && createError.error?.description?.includes('already exists')) {
            console.log('Customer already exists, fetching existing customer...');
            
            // Fetch all customers and find by email
            const customers = await razorpay.customers.all({
              count: 100,
            });
            
            const existingCustomer = customers.items?.find(
              (c: any) => c.email === customerEmail
            );
            
            if (existingCustomer) {
              customerId = existingCustomer.id;
              console.log('Found existing customer:', customerId);
            } else {
              throw new Error('Customer exists but could not be found');
            }
          } else {
            throw createError;
          }
        }

        // Update profile with customer ID
        if (customerId) {
          await supabase
            .from('profiles')
            .update({ razorpay_customer_id: customerId })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Failed to create/fetch Razorpay customer:', error);
        return NextResponse.json(
          { error: 'Failed to initialize payment' },
          { status: 500 }
        );
      }
    }

    try {
      const razorpay = getRazorpay();

      // Create order for one-time payment
      // Receipt must be max 40 chars - use short hash of user ID + timestamp
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits
      const userIdShort = user.id.slice(0, 8); // First 8 chars of UUID
      const receipt = `rcpt_${userIdShort}_${timestamp}`; // Format: rcpt_12345678_12345678 (28 chars)
      
      const order = await razorpay.orders.create({
        amount: plan.amount,
        currency: plan.currency,
        receipt: receipt,
        notes: {
          user_id: user.id,
          plan_id: planId,
          tier: plan.tier,
        },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        amount: plan.amount,
        currency: plan.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        customerName: profile?.full_name || user.user_metadata?.full_name || 'User',
        customerEmail: profile?.email || user.email || '',
        planId,
      });
    } catch (error) {
      console.error('Create order error:', error);
      return NextResponse.json(
        { error: 'Failed to create payment order', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
