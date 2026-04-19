import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('Razorpay credentials not configured. Payment features will be disabled.');
}

export const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

export const RAZORPAY_ENABLED = !!razorpay;

// Helper to get razorpay instance (throws if not configured)
export function getRazorpay(): Razorpay {
  if (!razorpay) {
    throw new Error('Razorpay is not configured');
  }
  return razorpay;
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  // USD Plans (International)
  pro_monthly_usd: {
    id: 'pro_monthly_usd',
    name: 'Pro Monthly',
    amount: 1200, // $12.00 in cents
    currency: 'USD',
    displayPrice: '$12',
    interval: 1,
    period: 'month' as const,
    tier: 'pro' as const,
    features: [
      'Unlimited resumes',
      'Unlimited AI reviews',
      'Complete ATS breakdown',
      'AI resume tailoring',
      'AI bullet enhancement',
      'Cover letter generator',
      'Version history',
      'DOCX & TXT export',
      'Priority support',
    ],
  },
  pro_plus_6month_usd: {
    id: 'pro_plus_6month_usd',
    name: 'Pro Plus (6 Months)',
    amount: 4800, // $48.00 in cents (save 33%)
    currency: 'USD',
    displayPrice: '$48',
    interval: 6,
    period: 'month' as const,
    tier: 'pro_plus' as const,
    features: [
      'Everything in Pro',
      'Save 33% vs monthly',
      '1 free human review',
      'Priority processing',
      'Early access features',
      'Job tracker (coming soon)',
      'Locked-in pricing',
      'Career resources',
    ],
  },

  // INR Plans (India - PPP Pricing)
  pro_monthly_inr: {
    id: 'pro_monthly_inr',
    name: 'Pro Monthly',
    amount: 49900, // ₹499.00 in paise (100 paise = 1 rupee)
    currency: 'INR',
    displayPrice: '₹499',
    interval: 1,
    period: 'month' as const,
    tier: 'pro' as const,
    features: [
      'Unlimited resumes',
      'Unlimited AI reviews',
      'Complete ATS breakdown',
      'AI resume tailoring',
      'AI bullet enhancement',
      'Cover letter generator',
      'Version history',
      'DOCX & TXT export',
      'Priority support',
    ],
  },
  pro_plus_6month_inr: {
    id: 'pro_plus_6month_inr',
    name: 'Pro Plus (6 Months)',
    amount: 249900, // ₹2,499.00 in paise (save 33%)
    currency: 'INR',
    displayPrice: '₹2,499',
    interval: 6,
    period: 'month' as const,
    tier: 'pro_plus' as const,
    features: [
      'Everything in Pro',
      'Save 33% vs monthly',
      '1 free human review',
      'Priority processing',
      'Early access features',
      'Job tracker (coming soon)',
      'Locked-in pricing',
      'Career resources',
    ],
  },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;
export type SubscriptionTier = 'free' | 'pro' | 'pro_plus';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due';

// Free tier limits
export const FREE_TIER_LIMITS = {
  resumes_per_month: 3,
  reviews_per_month: 2,
};

// Helper to get plan details
export function getPlanDetails(planId: SubscriptionPlanId) {
  return SUBSCRIPTION_PLANS[planId];
}

// Helper to check if user has Pro features
export function hasProFeatures(tier: SubscriptionTier): boolean {
  return tier === 'pro' || tier === 'pro_plus';
}

// Helper to check if user has Pro Plus features
export function hasProPlusFeatures(tier: SubscriptionTier): boolean {
  return tier === 'pro_plus';
}

// Helper to get plans by currency
export function getPlansByCurrency(currency: 'INR' | 'USD') {
  return Object.values(SUBSCRIPTION_PLANS).filter(
    plan => plan.currency === currency
  );
}

// Helper to get plan ID for tier and currency
export function getPlanIdForCurrency(
  tier: 'pro' | 'pro_plus',
  currency: 'INR' | 'USD'
): SubscriptionPlanId {
  const suffix = currency.toLowerCase();
  const prefix = tier === 'pro' ? 'pro_monthly' : 'pro_plus_6month';
  return `${prefix}_${suffix}` as SubscriptionPlanId;
}

// Razorpay webhook signature verification
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return expectedSignature === signature;
}

// Razorpay payment signature verification
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!process.env.RAZORPAY_KEY_SECRET) return false;
  
  const crypto = require('crypto');
  const text = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
  return expectedSignature === signature;
}

