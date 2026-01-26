'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Check, Loader2, AlertCircle, Sparkles, Crown, Rocket, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { SUBSCRIPTION_PLANS, type SubscriptionPlanId, hasProFeatures, hasProPlusFeatures } from '@/lib/razorpay';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const { user, initialized, initialize } = useAuthStore();
  const { tier, status, fetchSubscription, initialized: subInitialized } = useSubscriptionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(null);

  const isPro = hasProFeatures(tier);
  const isProPlus = hasProPlusFeatures(tier);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Fetch subscription status
  useEffect(() => {
    if (user && !subInitialized) {
      fetchSubscription();
    }
  }, [user, subInitialized, fetchSubscription]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (initialized && !user) {
      router.push('/sign-in?redirect=/pricing');
    }
  }, [initialized, user, router]);

  const handleUpgrade = async (planId: SubscriptionPlanId) => {
    if (!user) {
      router.push('/sign-in?redirect=/pricing');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedPlan(planId);

    try {
      // Create subscription/order
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      console.log('Subscription create response:', data);

      if (!response.ok) {
        console.error('Subscription create failed:', data);
        throw new Error(data.error || 'Failed to create subscription');
      }

      // Validate response data
      if (!data.keyId) {
        console.error('Missing keyId in response:', data);
        throw new Error('Payment configuration error: Missing API key');
      }

      if (!data.orderId) {
        console.error('Missing orderId in response:', data);
        throw new Error('Payment configuration error: Missing order ID');
      }

      // Load Razorpay script (check if already loaded)
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');

      const initRazorpay = () => {
        // Ensure Razorpay is loaded
        if (!window.Razorpay) {
          console.error('Razorpay SDK failed to load');
          setError('Payment system failed to initialize. Please refresh and try again.');
          setLoading(false);
          return;
        }

        console.log('Opening Razorpay checkout with:', {
          orderId: data.orderId,
          amount: data.amount,
          currency: data.currency,
          keyId: data.keyId,
          keyIdFormat: data.keyId ? `${data.keyId.substring(0, 8)}...` : 'undefined',
        });

        // Validate Razorpay key format
        if (!data.keyId || (!data.keyId.startsWith('rzp_test_') && !data.keyId.startsWith('rzp_live_'))) {
          console.error('Invalid Razorpay key format:', data.keyId);
          setError('Payment system configuration error. Please contact support.');
          setLoading(false);
          return;
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'ResuCraft',
          description: `${SUBSCRIPTION_PLANS[planId].name} Subscription`,
          order_id: data.orderId,
          // Note: We're using one-time orders, not subscriptions
          // So we only pass order_id, not subscription_id
          prefill: {
            name: data.customerName,
            email: data.customerEmail,
          },
          theme: {
            color: '#00B4D8',
          },
          handler: async function (response: any) {
            try {
              console.log('Payment successful, verifying...', response);
              
              // Verify payment
              const verifyResponse = await fetch('/api/subscription/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id || data.orderId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planId,
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.success) {
                console.log('Payment verified successfully');
                // Refresh subscription store to get updated status
                await fetchSubscription();
                router.push('/dashboard?upgraded=true');
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (err) {
              console.error('Payment verification error:', err);
              setError(err instanceof Error ? err.message : 'Payment verification failed');
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              console.log('Razorpay modal dismissed');
              setLoading(false);
              setSelectedPlan(null);
            },
            onerror: function (error: any) {
              console.error('Razorpay modal error:', error);
              setError('Payment failed. Please try again.');
              setLoading(false);
              setSelectedPlan(null);
            },
          },
        };

        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response: any) {
            console.error('Payment failed:', response.error);
            setError(response.error.description || 'Payment failed');
            setLoading(false);
            setSelectedPlan(null);
          });
          rzp.open();
        } catch (err) {
          console.error('Error opening Razorpay:', err);
          setError('Failed to open payment window. Please try again.');
          setLoading(false);
          setSelectedPlan(null);
        }
      };

      // If Razorpay is already loaded, use it directly
      if (window.Razorpay) {
        initRazorpay();
      } else if (existingScript) {
        // Script tag exists but Razorpay not yet loaded, wait for it
        existingScript.addEventListener('load', initRazorpay);
        existingScript.addEventListener('error', () => {
          console.error('Failed to load Razorpay script');
          setError('Failed to load payment system. Please check your internet connection.');
          setLoading(false);
          setSelectedPlan(null);
        });
      } else {
        // Load script for the first time
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = initRazorpay;
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          setError('Failed to load payment system. Please check your internet connection.');
          setLoading(false);
          setSelectedPlan(null);
        };
        document.body.appendChild(script);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  if (!initialized || !user) {
    return (
      <div className="min-h-screen animated-gradient aurora flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient aurora">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-brand-dark-bg/75 border-b border-brand-purple/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <ArrowLeft className="w-5 h-5 text-brand-cyan group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium text-brand-gray-text group-hover:text-brand-white">
                Back to Dashboard
              </span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center shadow-xl">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">ResuCraft</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-white mb-4">
            Upgrade to <span className="gradient-text">Pro</span>
          </h1>
          <p className="text-base sm:text-lg text-brand-gray-text max-w-2xl mx-auto">
            Unlock unlimited resumes, AI-powered features, and priority support
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold">Payment Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className={`relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg shadow-xl backdrop-blur-sm ${!isPro ? 'border-2 border-brand-green/50' : 'border-2 border-brand-purple/30'}`}>
            {!isPro && (
              <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-brand-green text-white text-xs font-bold shadow-lg flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Current</span>
              </div>
            )}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Rocket className="w-6 h-6 text-brand-purple-light" />
                <h3 className="text-2xl font-black text-brand-white">Free</h3>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-black text-brand-white">$0</span>
                <span className="text-brand-gray-text">/month</span>
              </div>
              <p className="text-brand-gray-text mt-2">{!isPro ? 'Your current plan' : 'Basic features'}</p>
            </div>

            <button
              disabled
              className={`block w-full py-3 px-6 rounded-xl text-center font-bold cursor-not-allowed mb-6 ${!isPro ? 'text-brand-green bg-brand-green/20 border border-brand-green/50' : 'text-brand-gray-dark bg-brand-navy/50'}`}
            >
              {!isPro ? 'Current Plan' : 'Free Plan'}
            </button>
            
            <div className="space-y-3">
              {['3 resumes per month', '2 AI reviews per month', '1 professional template', 'Basic ATS score', 'PDF download', 'Community support'].map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                  <span className="text-brand-gray-text text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan - Most Popular */}
          <div className={`relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 shadow-2xl backdrop-blur-sm md:transform md:scale-105 lg:scale-110 ${isPro && !isProPlus ? 'border-2 border-brand-green' : 'border-2 border-brand-cyan'}`}>
            {isPro && !isProPlus ? (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-brand-green text-white text-sm font-bold shadow-lg flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Current Plan</span>
              </div>
            ) : (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple text-white text-sm font-bold shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-6 h-6 text-brand-cyan" />
                <h3 className="text-2xl font-black text-brand-white">Pro</h3>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-black gradient-text">$12</span>
                <span className="text-brand-gray-text">/month</span>
              </div>
              <p className="text-brand-cyan-light mt-2 font-semibold">
                {isPro && !isProPlus ? 'Your current plan' : 'For active job seekers'}
              </p>
            </div>

            {isPro && !isProPlus ? (
              <button
                disabled
                className="block w-full py-3 px-6 rounded-xl text-center font-bold text-brand-green bg-brand-green/20 border border-brand-green/50 cursor-not-allowed mb-6"
              >
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Current Plan
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade('pro_monthly')}
                disabled={(loading && selectedPlan === 'pro_monthly') || isProPlus}
                className="block w-full py-3 px-6 rounded-xl text-center font-bold text-white bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-pink hover:scale-105 transition-all duration-300 shadow-xl glow-cyan mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && selectedPlan === 'pro_monthly' ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </span>
                ) : isProPlus ? (
                  'You have Pro Plus'
                ) : (
                  'Upgrade to Pro'
                )}
              </button>
            )}
            
            <div className="space-y-3">
              {SUBSCRIPTION_PLANS.pro_monthly.features.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" />
                  <span className="text-brand-white text-sm font-semibold">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plus Plan */}
          <div className={`relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg shadow-xl backdrop-blur-sm ${isProPlus ? 'border-2 border-brand-green' : 'border-2 border-brand-pink/30'}`}>
            {isProPlus ? (
              <div className="absolute -top-4 right-4 px-3 py-1 rounded-full bg-brand-green text-white text-xs font-bold shadow-lg flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Current</span>
              </div>
            ) : (
              <div className="absolute -top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-brand-purple to-brand-pink text-white text-xs font-bold shadow-lg">
                Save 33%
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-6 h-6 text-brand-pink" />
                <h3 className="text-2xl font-black text-brand-white">Pro Plus</h3>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-black text-brand-white">$48</span>
                <span className="text-brand-gray-text">/6 months</span>
              </div>
              <p className="text-brand-pink-light mt-2 font-semibold">
                {isProPlus ? 'Your current plan' : '$8/month • Best value'}
              </p>
            </div>

            {isProPlus ? (
              <button
                disabled
                className="block w-full py-3 px-6 rounded-xl text-center font-bold text-brand-green bg-brand-green/20 border border-brand-green/50 cursor-not-allowed mb-6"
              >
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Current Plan
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade('pro_plus_6month')}
                disabled={loading && selectedPlan === 'pro_plus_6month'}
                className="block w-full py-3 px-6 rounded-xl text-center font-bold text-white bg-gradient-to-r from-brand-purple to-brand-pink hover:scale-105 transition-all duration-300 shadow-lg mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && selectedPlan === 'pro_plus_6month' ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  'Get Pro Plus'
                )}
              </button>
            )}
            
            <div className="space-y-3">
              {SUBSCRIPTION_PLANS.pro_plus_6month.features.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-brand-pink mt-0.5 flex-shrink-0" />
                  <span className="text-brand-gray-text text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-brand-gray-text text-sm mb-4">
            Secure payment powered by Razorpay • Cancel anytime
          </p>
          <div className="flex items-center justify-center space-x-8 text-xs text-brand-gray-dark">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-brand-green" />
              <span>Instant activation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-brand-green" />
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-brand-green" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

