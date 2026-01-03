# ResuCraft Pricing Structure

## Currency & Conversion

- **Primary Currency**: USD (United States Dollars)
- **Razorpay Format**: Amounts are specified in **cents** (smallest unit)
  - 1 Dollar = 100 cents
  - $12 = 1,200 cents
  - $48 = 4,800 cents

## Subscription Plans

### 1. Free Plan
- **Price**: $0
- **Features**:
  - 3 resumes per month
  - 2 AI reviews per month
  - 1 professional template
  - Basic ATS score
  - PDF download
- **Limitations**:
  - Usage limits enforced via atomic database counters
  - Limits reset monthly

### 2. Pro Monthly
- **Price**: $12/month
- **Razorpay Amount**: 1,200 cents
- **Plan ID**: `pro_monthly`
- **Tier**: `pro`
- **Features**:
  - Unlimited resumes
  - Unlimited AI reviews
  - Complete ATS breakdown
  - AI resume tailoring
  - AI bullet enhancement
  - Cover letter generator
  - Version history
  - DOCX & TXT export
  - Priority support

### 3. Pro Plus (6 Months)
- **Price**: $48/6 months
- **Effective Monthly**: $8/month
- **Savings**: 33% vs monthly plan ($72 → $48)
- **Razorpay Amount**: 4,800 cents
- **Plan ID**: `pro_plus_6month`
- **Tier**: `pro_plus`
- **Features**:
  - Everything in Pro
  - Save 33% vs monthly
  - 1 free human review
  - Priority processing
  - Early access features
  - Job tracker (coming soon)
  - Locked-in pricing
  - Career resources

## Implementation Details

### Database Fields
All pricing information is stored in `lib/razorpay.ts`:

```typescript
export const SUBSCRIPTION_PLANS = {
  pro_monthly: {
    amount: 1200, // cents
    currency: 'USD',
    // ...
  },
  pro_plus_6month: {
    amount: 4800, // cents
    currency: 'USD',
    // ...
  },
}
```

### Test Mode
- Use Razorpay **test mode** keys for development
- Test cards work only with test API keys
- For USD payments, use international test cards

### Razorpay Test Cards

**For successful payments (USD):**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits (e.g., 123)
Expiry: Any future date (e.g., 12/25)
Name: Any name
```

**For UPI payments (test mode - INR only):**
```
UPI ID: success@razorpay
```

**For failed payments (testing error handling):**
```
Card Number: 4000 0000 0000 0002
```

## Billing Cycle

- **Monthly Plan**: Charged every month on the subscription date
- **6-Month Plan**: One-time charge, valid for 6 months
- **Free Plan**: No billing

## Upgrade Flow

1. User clicks "Upgrade to Pro" or "Get Pro Plus"
2. Frontend calls `/api/subscription/create` with plan ID
3. Backend creates Razorpay order
4. Razorpay checkout modal opens
5. User completes payment
6. Frontend calls `/api/subscription/verify`
7. Backend verifies payment signature
8. User's `subscription_tier` updated in database
9. Usage limits removed for Pro users

## Usage Limit Enforcement

- **Free tier limits** enforced using atomic database functions:
  - `increment_resume_counter()` - checks before allowing resume creation
  - `increment_review_counter()` - checks before allowing AI review
- **Pro tier**: All limits bypassed via `hasProFeatures()` check
- **Limits reset**: First day of each month via database function

## Revenue Model

### Monthly Recurring Revenue (MRR)
- Pro Monthly: $12 per active subscriber
- Pro Plus: $8 per active subscriber (amortized)

### Annual Contract Value (ACV)
- Pro Monthly: $144/year ($12 × 12)
- Pro Plus: $96/year ($48 × 2)

### Savings Incentive
- Monthly plan: $144/year
- 6-month plan: $96/year
- **Customer saves**: $48/year (33% discount)

## Future Enhancements

1. **Annual Plan**: $96/year (save 33%)
2. **Team Plans**: Discounts for 5+ users
3. **Lifetime Deal**: One-time payment
4. **Student Discount**: 50% off with edu email
5. **Multi-Currency**: Support INR, EUR, GBP with regional pricing

## Notes

- All amounts in code are in **cents**, not dollars
- Razorpay dashboard shows amounts in dollars (or selected currency)
- Webhook events use cents in payload
- Always convert for display: `amount / 100` to get dollars

