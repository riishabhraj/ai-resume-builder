# Pricing Implementation Guide

## ✅ Completed: Landing Page Pricing Section

### What Was Added

A beautiful, responsive pricing section has been added to the landing page (`app/page.tsx`) with three tiers:

#### 1. **Free Plan** - $0/month
- 3 resumes per month
- 2 AI reviews per month
- 1 professional template
- Basic ATS score
- PDF download
- Community support

#### 2. **Pro Plan** - $12/month (Most Popular)
- Unlimited resumes
- Unlimited AI reviews
- Complete ATS breakdown
- AI resume tailoring
- AI bullet enhancement
- Cover letter generator
- Version history
- DOCX & TXT export
- Priority support

#### 3. **Pro Plus Plan** - $48/6 months ($8/month - Save 33%)
- Everything in Pro
- 1 free human review (after 3 months)
- Priority processing (fastest)
- Early access to new features
- Job tracker (coming soon)
- Locked-in pricing
- Career resources

### Design Features

✅ **Visual Design:**
- Beautiful gradient cards with hover effects
- "Most Popular" badge on Pro plan
- "Save 33%" badge on Pro Plus
- Responsive 3-column layout (stacks on mobile)
- Cyan/purple/pink gradient accents matching brand
- Check/X icons for feature lists
- Smooth animations and transitions

✅ **User Experience:**
- Smooth scroll to #pricing from header
- Clear pricing comparison
- All CTAs point to sign-in (ready for upgrade logic later)
- Trust badges (secure checkout, cancel anytime, instant access)
- Navigation links added to header (Features, Pricing)

✅ **Positioning:**
- Placed after "How It Works" section
- Before final CTA section
- Optimal user journey placement

### Files Modified

1. **`app/page.tsx`**
   - Added pricing section with 3 plan cards
   - Added navigation links to header (Features, Pricing)
   - Imported new icons: Check, X, Sparkles, Crown, Rocket

2. **`app/globals.css`**
   - Added `scroll-behavior: smooth` for anchor link navigation

### Build Status

✅ **Build successful** - No errors, all pages compile correctly

---

## 🚀 Next Steps: Payment Integration

### Phase 1: Database Schema (Week 1)

Add subscription fields to `profiles` table:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' 
  CHECK (subscription_tier IN ('free', 'pro', 'pro_plus'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' 
  CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resumes_created_this_month INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviews_this_month INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_usage_reset_date DATE DEFAULT CURRENT_DATE;
```

Create subscription transactions table:

```sql
CREATE TABLE subscription_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT NOT NULL,
  razorpay_subscription_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('pro_monthly', 'pro_plus_6month')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 2: Usage Limits (Week 1)

Implement usage counters in API routes:

**Files to modify:**
- `app/api/resume/save/route.ts` - Check `resumes_created_this_month`
- `app/api/review-resume/route.ts` - Check `reviews_this_month`
- `app/api/tailor-resume/route.ts` - Check if user is Pro

**Logic:**
```typescript
// Example for resume creation limit
if (user.subscription_tier === 'free' && user.resumes_created_this_month >= 3) {
  return NextResponse.json(
    { error: 'Resume limit reached. Upgrade to Pro for unlimited resumes.' },
    { status: 403 }
  );
}
```

### Phase 3: Razorpay Integration (Week 2)

1. **Environment Variables** (`.env.local`):
```bash
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
```

2. **Install Razorpay SDK**:
```bash
pnpm add razorpay
```

3. **Create API Routes**:
   - `app/api/subscription/create/route.ts` - Create Razorpay subscription
   - `app/api/subscription/verify/route.ts` - Verify payment signature
   - `app/api/subscription/webhook/route.ts` - Handle Razorpay webhooks
   - `app/api/subscription/cancel/route.ts` - Cancel subscription

4. **Create Subscription Page** (`app/pricing/page.tsx`):
   - Integrate Razorpay Checkout
   - Handle success/failure states
   - Show current plan if user is subscribed

5. **Update Upgrade Button**:
   - Change "Upgrade to Pro" button to navigate to checkout
   - Add Razorpay payment modal

### Phase 4: Pro Features Unlock (Week 3)

**Files to modify:**
- `app/api/tailor-resume/route.ts` - Restrict to Pro users
- `components/AIReviewModal.tsx` - Show full breakdown only for Pro
- `app/create/page.tsx` - Enable version history for Pro
- Add export format options (DOCX, TXT) for Pro

### Phase 5: Subscription Management (Week 4)

**Create subscription management page** (`app/account/subscription/page.tsx`):
- Show current plan
- Upgrade/downgrade options
- Cancel subscription
- View billing history
- Update payment method

---

## 📊 Pricing Strategy Summary

### Conversion Funnel

```
Landing Page → Sign Up (Free) → Use Free Features (3 resumes, 2 reviews)
                                        ↓
                        Hit Limit → Upgrade Prompt → Choose Plan
                                        ↓
                        Razorpay Checkout → Pro/Pro Plus Access
```

### Key Metrics to Track

1. **Free to Pro conversion rate**
2. **Pro to Pro Plus upgrade rate**
3. **Monthly recurring revenue (MRR)**
4. **Churn rate**
5. **Average revenue per user (ARPU)**

### Pricing Rationale

- **Free**: Generous enough to convert, limited enough to upgrade
- **Pro $12/month**: Competitive (Rezi $29, Jobscan $49)
- **Pro Plus $48/6mo**: 33% discount incentivizes commitment

### Revenue Projections

**Conservative (1000 users after 3 months):**
- 80% Free (800) = $0
- 15% Pro (150) = $1,800/month
- 5% Pro Plus (50) = $400/month
- **Total: $2,200/month or $26,400/year**

**Growth (5000 users after 6 months):**
- **Total: $11,000/month or $132,000/year**

---

## 🎨 Design Principles Used

1. **Progressive Disclosure**: Show value before asking for payment
2. **Social Proof**: "Most Popular" badge on Pro plan
3. **Scarcity**: "Save 33%" creates urgency
4. **Clear Comparison**: Check/X marks make differences obvious
5. **Trust Signals**: "Cancel anytime", "Secure checkout"
6. **Visual Hierarchy**: Pro plan stands out with scale and glow

---

## 🔧 Testing Checklist (Before Launch)

### UI Testing
- [ ] Pricing cards display correctly on desktop
- [ ] Pricing cards stack properly on mobile
- [ ] Smooth scroll from header to #pricing works
- [ ] All CTAs navigate to correct pages
- [ ] Hover effects work on all cards

### Payment Integration Testing
- [ ] Razorpay test mode works
- [ ] Payment success updates database
- [ ] Webhook receives and processes events
- [ ] Subscription status updates correctly
- [ ] Usage counters reset monthly

### Feature Access Testing
- [ ] Free users hit limits correctly
- [ ] Pro users have unlimited access
- [ ] Pro Plus users get all bonuses
- [ ] Upgrade prompts show at correct times

### Edge Cases
- [ ] What if payment fails?
- [ ] What if webhook is delayed?
- [ ] What if user cancels during trial?
- [ ] What if user downgrades?
- [ ] What if subscription expires?

---

## 📝 Implementation Priority

### ✅ **Completed**
1. Pricing page UI on landing page
2. Smooth scroll navigation
3. Responsive design
4. Build verification

### 🔜 **Up Next**
1. Database schema migration
2. Usage limit implementation
3. Razorpay integration
4. Upgrade flow

### 💡 **Quick Wins for V1**
- Start with just Pro monthly ($12)
- Add Pro Plus after validating demand
- Keep Free tier generous to drive signups
- Focus on smooth upgrade experience

---

**Status**: 🎨 UI Complete | 🔌 Ready for Payment Integration
**Estimated Time to Payment Launch**: 2-3 weeks
**Blockers**: None - Ready to start Razorpay integration

---

*Document created: January 3, 2025*
*Last updated: January 3, 2025*

