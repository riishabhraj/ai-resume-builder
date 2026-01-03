-- Add atomic counter increment functions to prevent race conditions
-- These functions use SELECT FOR UPDATE to lock rows during counter increments

-- Function to atomically increment resume counter and check limit
-- Returns the new counter value, or -1 if limit was exceeded
CREATE OR REPLACE FUNCTION increment_resume_counter(
  p_user_id UUID,
  p_limit INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_counter INTEGER;
  v_tier TEXT;
  v_last_reset DATE;
  v_is_new_month BOOLEAN;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT 
    subscription_tier,
    resumes_created_this_month,
    last_usage_reset_date,
    (last_usage_reset_date < DATE_TRUNC('month', CURRENT_DATE)::DATE) AS is_new_month
  INTO v_tier, v_counter, v_last_reset, v_is_new_month
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- If it's a new month, reset counters
  IF v_is_new_month THEN
    v_counter := 0;
    UPDATE profiles
    SET 
      resumes_created_this_month = 0,
      reviews_this_month = 0,
      last_usage_reset_date = CURRENT_DATE
    WHERE id = p_user_id;
  END IF;
  
  -- Check if limit would be exceeded (only for non-pro users)
  IF v_tier NOT IN ('pro', 'pro_plus') AND v_counter >= p_limit THEN
    RETURN -1; -- Limit exceeded
  END IF;
  
  -- Atomically increment counter
  UPDATE profiles
  SET resumes_created_this_month = resumes_created_this_month + 1
  WHERE id = p_user_id;
  
  -- Return new counter value
  RETURN v_counter + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to atomically increment review counter and check limit
-- Returns the new counter value, or -1 if limit was exceeded
CREATE OR REPLACE FUNCTION increment_review_counter(
  p_user_id UUID,
  p_limit INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_counter INTEGER;
  v_tier TEXT;
  v_last_reset DATE;
  v_is_new_month BOOLEAN;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT 
    subscription_tier,
    reviews_this_month,
    last_usage_reset_date,
    (last_usage_reset_date < DATE_TRUNC('month', CURRENT_DATE)::DATE) AS is_new_month
  INTO v_tier, v_counter, v_last_reset, v_is_new_month
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- If it's a new month, reset counters
  IF v_is_new_month THEN
    v_counter := 0;
    UPDATE profiles
    SET 
      resumes_created_this_month = 0,
      reviews_this_month = 0,
      last_usage_reset_date = CURRENT_DATE
    WHERE id = p_user_id;
  END IF;
  
  -- Check if limit would be exceeded (only for non-pro users)
  IF v_tier NOT IN ('pro', 'pro_plus') AND v_counter >= p_limit THEN
    RETURN -1; -- Limit exceeded
  END IF;
  
  -- Atomically increment counter
  UPDATE profiles
  SET reviews_this_month = reviews_this_month + 1
  WHERE id = p_user_id;
  
  -- Return new counter value
  RETURN v_counter + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION increment_resume_counter IS 'Atomically increments resume counter with row-level locking to prevent race conditions. Returns -1 if limit exceeded.';
COMMENT ON FUNCTION increment_review_counter IS 'Atomically increments review counter with row-level locking to prevent race conditions. Returns -1 if limit exceeded.';

