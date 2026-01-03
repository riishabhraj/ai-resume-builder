# Razorpay Payment Integration - Complete Implementation Guide

## ✅ What's Been Implemented

### 1. Database Schema
- ✅ Subscription fields in profiles table
- ✅ Usage tracking (resumes_created_this_month, reviews_this_month)
- ✅ subscription_transactions table
- ✅ RLS policies for data security
- ✅ Helper functions for monthly usage reset

### 2. Backend API Routes
- ✅ `/api/subscription/create` - Create payment order
- ✅ `/api/subscription/verify` - Verify payment signature
- ✅ `/api/subscription/webhook` - Handle Razorpay webhooks
- ✅ `/api/subscription/cancel` - Cancel subscription
- ✅ `/api/subscription/status` - Get subscription status

### 3. Usage Limits
- ✅ Resume creation limits (3/month for free)
- ✅ AI review limits (2/month for free)
- ✅ Automatic monthly reset
- ✅ Pro/Pro Plus bypass limits

### 4. Frontend Pages
- ✅ Pricing page (`/pricing`) with all 3 tiers
- ✅ Razorpay checkout integration
- ✅ Upgrade modal component
- ✅ Landing page links to pricing

### 5. Configuration
- ✅ Razorpay SDK integrated
- ✅ Plan configuration in `lib/razorpay.ts`
- ✅ Free tier limits defined
- ✅ Helper functions for tier checks

---

## 🚀 Next Steps to Go Live

### Step 1: Database Migration

Run the SQL migration in your Supabase dashboard:

```sql
-- Location: supabase/migrations/20250103000000_add_subscription_fields.sql
-- This adds all subscription and usage tracking fields
```

### Step 2: Set Environment Variables

Add to your `.env.local`:

```bash
# Razorpay Keys (get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Webhook Secret (from Razorpay Dashboard > Webhooks)
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

### Step 3: Configure Razorpay Webhook

1. Go to https://dashboard.razorpay.com/app/webhooks
2. Create new webhook
3. URL: `https://yourdomain.com/api/subscription/webhook`
4. Events to select:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.paused`
   - `subscription.completed`
   - `payment.failed`
5. Save and copy the webhook secret

### Step 4: Test Payment Flow

1. Start your dev server: `pnpm dev`
2. Go to `/pricing`
3. Click "Upgrade to Pro"
4. Use test card: `4111 1111 1111 1111`
5. CVV: any 3 digits, Expiry: any future date
6. Complete payment
7. Verify subscription status updates in database

### Step 5: Verify Webhook

1. Make a test payment
2. Check Razorpay Dashboard > Webhooks > Logs
3. Verify webhook was called successfully
4. Check your database `profiles` table
5. Confirm `subscription_tier` updated to `pro`

---

## 💰 Pricing Plans

### Free (Current Default)
- 3 resumes per month
- 2 AI reviews per month
- 1 template
- Basic ATS score
- PDF download

### Pro - ₹12/month
- Unlimited resumes
- Unlimited AI reviews
- Complete ATS breakdown
- AI tailoring & bullet enhancement
- Cover letter generator
- Version history
- Multiple export formats
- Priority support

### Pro Plus - ₹48/6 months (₹8/month)
- Everything in Pro
- Save 33%
- 1 free human review
- Priority processing
- Early access features
- Job tracker (coming soon)
- Locked-in pricing

---

## 🔧 How It Works

### Payment Flow

1. User clicks "Upgrade to Pro" on `/pricing`
2. Frontend calls `/api/subscription/create`
3. Backend creates Razorpay order
4. Razorpay checkout modal opens
5. User completes payment
6. Frontend calls `/api/subscription/verify`
7. Backend verifies signature and updates database
8. User redirected to dashboard with Pro access

### Webhook Flow

1. Razorpay sends webhook events to `/api/subscription/webhook`
2. Backend verifies webhook signature
3. Updates user's subscription status based on event
4. Records transaction in `subscription_transactions` table

### Usage Tracking

1. When user creates resume/review:
   - Check `subscription_tier`
   - If free, check usage counter
   - If limit reached, return 403 error
   - Otherwise, increment counter
2. Monthly reset:
   - Check `last_usage_reset_date`
   - If new month, reset counters to 0

---

## 📁 File Structure

```
app/
├── api/
│   ├── subscription/
│   │   ├── create/route.ts      # Create payment order
│   │   ├── verify/route.ts      # Verify payment
│   │   ├── webhook/route.ts     # Handle webhooks
│   │   ├── cancel/route.ts      # Cancel subscription
│   │   └── status/route.ts      # Get status
│   ├── resume/save/route.ts     # ✅ Usage limits added
│   └── review-resume/route.ts   # ✅ Usage limits added
├── pricing/page.tsx             # Pricing & checkout page
└── page.tsx                     # Landing page (updated)

components/
└── UpgradeModal.tsx             # Upgrade prompt modal

lib/
├── razorpay.ts                  # Razorpay config & helpers
└── auto-save.ts                 # ✅ Limit error handling

supabase/migrations/
└── 20250103000000_add_subscription_fields.sql
```

---

## 🧪 Testing Checklist

### Payment Flow
- [ ] Can access pricing page
- [ ] Can click upgrade button
- [ ] Razorpay checkout opens
- [ ] Test payment succeeds
- [ ] User redirected to dashboard
- [ ] Database shows subscription_tier = 'pro'

### Usage Limits
- [ ] Free user creates 3 resumes
- [ ] 4th resume shows upgrade modal
- [ ] Free user uses 2 reviews
- [ ] 3rd review shows upgrade modal
- [ ] Pro user has unlimited access

### Webhooks
- [ ] Webhook endpoint is accessible
- [ ] Signature verification works
- [ ] `subscription.activated` updates tier
- [ ] `payment.failed` marks as past_due
- [ ] `subscription.cancelled` updates status

### Edge Cases
- [ ] Payment failure handled gracefully
- [ ] Webhook retry works
- [ ] Monthly counter resets correctly
- [ ] Concurrent requests don't break counters

---

## 🐛 Common Issues & Solutions

### "Payment system is not configured"
**Cause**: Missing Razorpay environment variables
**Fix**: Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env.local`

### Webhook not updating database
**Cause**: Webhook signature mismatch or wrong URL
**Fix**: 
1. Verify `RAZORPAY_WEBHOOK_SECRET` is correct
2. Check webhook URL in Razorpay Dashboard
3. Ensure URL is publicly accessible (use ngrok for local testing)

### Usage limits not resetting
**Cause**: `last_usage_reset_date` not updating
**Fix**: The reset happens automatically on next request, verify the logic in API routes

### Subscription activated but user still sees free
**Cause**: Database not updated or client-side cache
**Fix**:
1. Check `profiles` table for correct `subscription_tier`
2. Clear browser cache and re-fetch user data
3. Check webhook logs in Razorpay Dashboard

---

## 🔒 Security Notes

1. **Webhook Signature**: Always verify webhook signatures
2. **Server-Side Checks**: All subscription checks happen server-side
3. **RLS Policies**: Row Level Security protects user data
4. **API Keys**: Never expose secret keys in frontend code
5. **Payment Verification**: Always verify payment signature before activating subscription

---

## 📊 Monitoring

### Razorpay Dashboard
- Payments: Track all transactions
- Subscriptions: Monitor active subscriptions
- Webhooks: View webhook logs and failures
- Analytics: Revenue and conversion metrics

### Database Queries

```sql
-- Active subscriptions
SELECT COUNT(*) FROM profiles WHERE subscription_status = 'active';

-- Revenue by plan
SELECT subscription_tier, COUNT(*) as users
FROM profiles
WHERE subscription_status = 'active'
GROUP BY subscription_tier;

-- Failed payments
SELECT * FROM subscription_transactions
WHERE status = 'failed'
ORDER BY created_at DESC;

-- Usage stats
SELECT 
  AVG(resumes_created_this_month) as avg_resumes,
  AVG(reviews_this_month) as avg_reviews
FROM profiles
WHERE subscription_tier = 'free';
```

---

## 🎯 Success Metrics to Track

1. **Conversion Rate**: Free to Pro conversions
2. **Churn Rate**: Cancelled vs active subscriptions
3. **MRR**: Monthly Recurring Revenue
4. **ARPU**: Average Revenue Per User
5. **Limit Hit Rate**: How often users hit free tier limits
6. **Payment Success Rate**: Successful vs failed payments

---

## 🚀 Future Enhancements

1. **Annual Plans**: Add 12-month option with bigger discount
2. **Promo Codes**: Implement coupon system
3. **Trial Period**: Offer 7-day free trial
4. **Referral Program**: Give credits for referrals
5. **Usage Analytics**: Show users their usage stats
6. **Auto-Retry**: Retry failed payments automatically
7. **Email Notifications**: Send emails for payment events
8. **Invoice Generation**: PDF invoices for business users

---

**Status**: ✅ Payment Integration Complete and Ready for Testing
**Last Updated**: January 3, 2025
**Build Status**: ✅ Successful

