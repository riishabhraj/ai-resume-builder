import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const isValid = verifyWebhookSignature(body, signature, webhookSecret);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const supabase = await createClient();
    
    if (!supabase) {
      console.error('Database not configured');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    console.log('Razorpay webhook event:', event.event);

    // Handle different webhook events
    switch (event.event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const subscription = event.payload.subscription.entity;
        const payment = event.payload.payment?.entity;
        const userId = subscription.notes?.user_id;
        const tier = subscription.notes?.tier || 'pro';

        if (!userId) {
          console.error('Missing user_id in subscription notes');
          break;
        }

        // Calculate end date
        const startDate = new Date(subscription.start_at * 1000);
        const endDate = new Date(subscription.end_at * 1000);

        // Update profile
        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            razorpay_subscription_id: subscription.id,
            subscription_start_date: startDate.toISOString(),
            subscription_end_date: endDate.toISOString(),
            subscription_cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        // Record transaction if payment exists
        if (payment) {
          await supabase
            .from('subscription_transactions')
            .insert({
              user_id: userId,
              razorpay_payment_id: payment.id,
              razorpay_subscription_id: subscription.id,
              amount: payment.amount,
              currency: payment.currency,
              status: payment.status,
              plan_type: subscription.notes?.plan_id || 'pro_monthly',
              payment_method: payment.method,
            });
        }

        console.log(`Subscription activated for user ${userId}`);
        break;
      }

      case 'subscription.cancelled': {
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.user_id;

        if (!userId) break;

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            subscription_cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        console.log(`Subscription cancelled for user ${userId}`);
        break;
      }

      case 'subscription.paused': {
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.user_id;

        if (!userId) break;

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        console.log(`Subscription paused for user ${userId}`);
        break;
      }

      case 'subscription.completed': {
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.user_id;

        if (!userId) break;

        // Subscription completed (all cycles done)
        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'inactive',
            razorpay_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        console.log(`Subscription completed for user ${userId}`);
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const userId = payment.notes?.user_id;

        if (!userId) break;

        // Mark subscription as past_due
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        // Record failed transaction
        await supabase
          .from('subscription_transactions')
          .insert({
            user_id: userId,
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id,
            amount: payment.amount,
            currency: payment.currency,
            status: 'failed',
            plan_type: payment.notes?.plan_id || 'pro_monthly',
          });

        console.log(`Payment failed for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

