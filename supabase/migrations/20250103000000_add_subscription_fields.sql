-- Add subscription fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' 
  CHECK (subscription_tier IN ('free', 'pro', 'pro_plus'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' 
  CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT false;

-- Usage tracking fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resumes_created_this_month INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviews_this_month INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_usage_reset_date DATE DEFAULT CURRENT_DATE;

-- Create subscription transactions table
CREATE TABLE IF NOT EXISTS subscription_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  razorpay_payment_id TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_subscription_id TEXT,
  razorpay_signature TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('pro_monthly', 'pro_plus_6month')),
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_user_id ON subscription_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_razorpay_subscription_id ON subscription_transactions(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Enable RLS on subscription_transactions
ALTER TABLE subscription_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_transactions
CREATE POLICY "Users can view their own transactions"
  ON subscription_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON subscription_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to reset monthly usage counters
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    resumes_created_this_month = 0,
    reviews_this_month = 0,
    last_usage_reset_date = CURRENT_DATE
  WHERE 
    last_usage_reset_date < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check and reset usage if needed
CREATE OR REPLACE FUNCTION check_and_reset_usage(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    resumes_created_this_month = 0,
    reviews_this_month = 0,
    last_usage_reset_date = CURRENT_DATE
  WHERE 
    id = p_user_id
    AND last_usage_reset_date < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to document the schema
COMMENT ON COLUMN profiles.subscription_tier IS 'User subscription tier: free, pro, or pro_plus';
COMMENT ON COLUMN profiles.subscription_status IS 'Subscription status: active, inactive, cancelled, or past_due';
COMMENT ON COLUMN profiles.razorpay_subscription_id IS 'Razorpay subscription ID for recurring payments';
COMMENT ON COLUMN profiles.razorpay_customer_id IS 'Razorpay customer ID';
COMMENT ON COLUMN profiles.resumes_created_this_month IS 'Counter for resumes created in current month';
COMMENT ON COLUMN profiles.reviews_this_month IS 'Counter for AI reviews used in current month';
COMMENT ON TABLE subscription_transactions IS 'Records all subscription payment transactions';

