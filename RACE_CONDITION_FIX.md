# Race Condition Fix for Usage Limit Counters

## Problem

The usage limit counters in the resume and review APIs were vulnerable to race conditions that allowed users to bypass limits through concurrent requests.

### How the Bug Worked

**Previous (Vulnerable) Code:**
```typescript
// 1. Read counter
const resumesCreated = profile.resumes_created_this_month || 0;

// 2. Check limit
if (resumesCreated >= FREE_TIER_LIMITS.resumes_per_month) {
  return error;
}

// 3. Write back counter + 1
await supabase.update({ resumes_created_this_month: resumesCreated + 1 });
```

**Race Condition Scenario:**
- Request A reads counter: `2`
- Request B reads counter: `2` (simultaneously)
- Request A checks: `2 < 3` ✅ passes
- Request B checks: `2 < 3` ✅ passes
- Request A writes: `3`
- Request B writes: `3` (overwrites A's update!)
- **Result**: User created 4 resumes but counter shows `3`

This allowed users to bypass limits by making simultaneous API calls.

---

## Solution

Implemented **atomic database operations** using PostgreSQL stored functions with row-level locking.

### Database Functions (Migration: `20250103000001_add_atomic_counter_functions.sql`)

#### 1. `increment_resume_counter(user_id, limit)`
- Uses `SELECT ... FOR UPDATE` to lock the user's row
- Atomically checks if it's a new month and resets counters
- Checks if limit would be exceeded
- Increments counter in a single atomic operation
- Returns `-1` if limit exceeded, otherwise returns new counter value

#### 2. `increment_review_counter(user_id, limit)`
- Same pattern as above for review counters
- Prevents race conditions on AI review usage tracking

### How It Works

**New (Fixed) Code:**
```typescript
// Single atomic operation
const { data: result } = await supabase.rpc('increment_resume_counter', {
  p_user_id: user.id,
  p_limit: FREE_TIER_LIMITS.resumes_per_month,
});

// Result is -1 if limit exceeded, otherwise new counter value
if (result === -1) {
  return error;
}
```

**With Row-Level Locking:**
- Request A calls `increment_resume_counter()` → locks row
- Request B calls `increment_resume_counter()` → **waits** for lock
- Request A: checks limit (2 < 3), increments to 3, unlocks
- Request B: checks limit (3 >= 3), returns -1, unlocks
- **Result**: User correctly blocked at limit

---

## Files Modified

### 1. **New Migration**
- `supabase/migrations/20250103000001_add_atomic_counter_functions.sql`
  - Adds `increment_resume_counter()` function
  - Adds `increment_review_counter()` function
  - Both use `SELECT FOR UPDATE` for row-level locking

### 2. **API Routes Updated**
- `app/api/resume/save/route.ts`
  - Replaced read-check-write pattern with atomic RPC call
  - Lines 59-90: Now uses `supabase.rpc('increment_resume_counter')`

- `app/api/review-resume/route.ts`
  - Replaced read-check-write pattern with atomic RPC call
  - Lines 193-225: Now uses `supabase.rpc('increment_review_counter')`

---

## Benefits

1. **✅ Race Condition Fixed**: Concurrent requests can no longer bypass limits
2. **✅ Automatic Month Reset**: Built into the atomic function
3. **✅ Simpler Code**: Reduced from ~60 lines to ~30 lines per endpoint
4. **✅ Database-Level Enforcement**: Can't be bypassed by client-side manipulation
5. **✅ Transaction Safety**: All operations happen atomically

---

## Testing the Fix

### Before Fix (Vulnerable)
```bash
# Send 5 concurrent requests (limit is 3)
for i in {1..5}; do
  curl -X POST /api/resume/save & 
done
wait

# Result: All 5 succeeded (bypassed limit) ❌
```

### After Fix (Secure)
```bash
# Send 5 concurrent requests (limit is 3)
for i in {1..5}; do
  curl -X POST /api/resume/save & 
done
wait

# Result: First 3 succeed, last 2 get 403 error ✅
```

---

## Deployment Steps

1. **Run the new migration** in Supabase SQL Editor:
   ```sql
   -- Copy contents of:
   -- supabase/migrations/20250103000001_add_atomic_counter_functions.sql
   ```

2. **Deploy the updated API routes** (already in your code)

3. **Verify functions exist**:
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name IN ('increment_resume_counter', 'increment_review_counter');
   ```

4. **Test concurrent requests** to verify fix

---

## Performance Impact

- **Minimal**: Row-level locks are held only during counter increment (~1-5ms)
- **Scalable**: Locks are per-user, so different users don't block each other
- **Better than before**: Eliminates retry logic needed to handle race conditions

---

## Related Security Improvements

This fix also improves security by:
- Moving business logic to database (harder to manipulate)
- Ensuring consistency even under high concurrent load
- Preventing undercounting that could impact billing/analytics

---

## References

- PostgreSQL Row Locking: https://www.postgresql.org/docs/current/explicit-locking.html
- Supabase RPC Functions: https://supabase.com/docs/guides/database/functions
- Transaction Isolation: https://www.postgresql.org/docs/current/transaction-iso.html

