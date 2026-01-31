'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Crown,
  Sparkles,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Receipt,
  ArrowLeft,
  ArrowUpRight,
  XCircle,
  Calendar,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { hasProFeatures, hasProPlusFeatures, SUBSCRIPTION_PLANS } from '@/lib/razorpay';
import { shouldRedirectToWaitlist } from '@/lib/waitlist-check';

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, initialized, initialize } = useAuthStore();
  const {
    tier,
    startDate,
    endDate,
    cancelAtPeriodEnd,
    transactions,
    cancelSubscription,
    reactivateSubscription,
    fetchSubscription,
    loading: storeLoading,
    initialized: subInitialized,
    error: storeError,
    clearError,
  } = useSubscriptionStore();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [reactivateSuccess, setReactivateSuccess] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (shouldRedirectToWaitlist()) {
      router.push('/waitlist');
    }
  }, [router]);

  useEffect(() => {
    if (user && !subInitialized) {
      fetchSubscription();
    }
  }, [user, subInitialized, fetchSubscription]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (initialized && !user) {
      router.push('/sign-in?redirect=/subscription');
    }
  }, [initialized, user, router]);

  const isPro = hasProFeatures(tier);
  const isProPlus = hasProPlusFeatures(tier);

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format currency
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  // Get plan details
  const getPlanDetails = () => {
    if (isProPlus) {
      return SUBSCRIPTION_PLANS.pro_plus_6month;
    }
    if (isPro) {
      return SUBSCRIPTION_PLANS.pro_monthly;
    }
    return null;
  };

  const planDetails = getPlanDetails();

  // Handle cancel subscription
  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);

    try {
      const result = await cancelSubscription();

      if (result.success) {
        setCancelSuccess(true);
        setShowCancelConfirm(false);
        await fetchSubscription();
      } else {
        setCancelError(result.message);
      }
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  // Handle reactivate subscription
  const handleReactivate = async () => {
    setReactivating(true);
    clearError();
    setCancelError(null);

    try {
      const result = await reactivateSubscription();

      if (result.success) {
        setReactivateSuccess(true);
        setCancelSuccess(false);
        await fetchSubscription();
      } else {
        if (result.message) {
          setCancelError(result.message);
        }
      }
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : 'Failed to reactivate subscription');
    } finally {
      setReactivating(false);
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="flex items-center space-x-4 mb-8">
          {isProPlus ? (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center shadow-xl">
              <Crown className="w-7 h-7 text-white" />
            </div>
          ) : isPro ? (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center shadow-xl">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gray-700 flex items-center justify-center shadow-xl">
              <CreditCard className="w-7 h-7 text-gray-400" />
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {isProPlus ? 'Pro Plus' : isPro ? 'Pro' : 'Free'} Plan
            </h1>
            <p className="text-gray-400">
              {isPro ? 'Manage your subscription' : 'Your current plan'}
            </p>
          </div>
        </div>

        {storeLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Subscription Status Card */}
            {isPro && (
              <div className={`p-5 rounded-2xl border ${
                cancelAtPeriodEnd
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-brand-green/10 border-brand-green/30'
              }`}>
                <div className="flex items-start space-x-4">
                  {cancelAtPeriodEnd ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-brand-green flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-lg font-semibold ${cancelAtPeriodEnd ? 'text-amber-400' : 'text-brand-green'}`}>
                      {cancelAtPeriodEnd ? 'Subscription Cancelled' : 'Active Subscription'}
                    </p>
                    <p className="text-gray-400 mt-1">
                      {cancelAtPeriodEnd
                        ? `Your access will end on ${formatDate(endDate)}. You can continue using Pro features until then.`
                        : `Your subscription will automatically renew on ${formatDate(endDate)}.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cancel Success Message */}
            {cancelSuccess && (
              <div className="p-5 rounded-2xl bg-brand-green/10 border border-brand-green/30">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-brand-green flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-lg font-semibold text-brand-green">Subscription Cancelled</p>
                    <p className="text-gray-400 mt-1">
                      Your subscription has been cancelled. You'll retain Pro access until the end of your billing period.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reactivate Success Message */}
            {reactivateSuccess && (
              <div className="p-5 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-brand-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-lg font-semibold text-brand-cyan">Subscription Reactivated</p>
                    <p className="text-gray-400 mt-1">
                      Your subscription has been reactivated and will automatically renew on {formatDate(endDate)}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {(storeError || cancelError) && (
              <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-red-400">Error</p>
                    <p className="text-gray-400 mt-1">{storeError || cancelError}</p>
                  </div>
                  <button
                    onClick={() => {
                      clearError();
                      setCancelError(null);
                    }}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Plan Details */}
            {planDetails && (
              <div className="p-6 rounded-2xl bg-brand-dark-card border border-brand-purple/30">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Plan Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                    <p className="text-xs text-gray-500 mb-1">Plan</p>
                    <p className="text-base font-semibold text-white">{planDetails.name}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                    <p className="text-xs text-gray-500 mb-1">Price</p>
                    <p className="text-base font-semibold text-white">
                      {formatAmount(planDetails.amount, planDetails.currency)}
                      <span className="text-gray-400 font-normal text-sm">
                        /{planDetails.interval === 1 ? 'month' : `${planDetails.interval} months`}
                      </span>
                    </p>
                    {planDetails.interval > 1 && (
                      <p className="text-xs text-brand-cyan mt-1">
                        {formatAmount(planDetails.amount / planDetails.interval, planDetails.currency)}/month
                      </p>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                    <p className="text-xs text-gray-500 mb-1">Started</p>
                    <p className="text-base font-semibold text-white">{formatDate(startDate)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                    <p className="text-xs text-gray-500 mb-1">{cancelAtPeriodEnd ? 'Ends' : 'Renews'}</p>
                    <p className="text-base font-semibold text-white">{formatDate(endDate)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Billing History */}
            {transactions.length > 0 && (
              <div className="p-6 rounded-2xl bg-brand-dark-card border border-brand-purple/30">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Billing History
                </h2>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.status === 'captured' || tx.status === 'paid'
                            ? 'bg-brand-green/20'
                            : 'bg-red-500/20'
                        }`}>
                          {tx.status === 'captured' || tx.status === 'paid' ? (
                            <Receipt className="w-5 h-5 text-brand-green" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {tx.plan_type === 'pro_plus_6month' ? 'Pro Plus' : 'Pro Monthly'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(tx.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          tx.status === 'captured' || tx.status === 'paid' ? 'text-white' : 'text-red-400'
                        }`}>
                          {formatAmount(tx.amount, tx.currency)}
                        </p>
                        <p className={`text-sm ${
                          tx.status === 'captured' || tx.status === 'paid' ? 'text-brand-green' : 'text-red-400'
                        }`}>
                          {tx.status === 'captured' || tx.status === 'paid' ? 'Paid' : 'Failed'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade Prompt for Free Users */}
            {!isPro && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-purple/20 to-brand-pink/20 border border-brand-purple/30">
                <div className="flex items-start space-x-4">
                  <Sparkles className="w-6 h-6 text-brand-cyan flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-white">Upgrade to Pro</p>
                    <p className="text-gray-400 mt-1">
                      Get unlimited resumes, AI reviews, and premium features starting at $12/month.
                    </p>
                    <Link
                      href="/pricing"
                      className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-semibold hover:opacity-90 transition-opacity inline-flex items-center space-x-2"
                    >
                      <span>View Plans</span>
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Reactivate Subscription Section */}
            {isPro && cancelAtPeriodEnd && !reactivateSuccess && (
              <div className="p-6 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30">
                <p className="text-lg text-brand-cyan font-semibold mb-2">
                  Reactivate Your Subscription
                </p>
                <p className="text-gray-400 mb-4">
                  Changed your mind? Reactivate your subscription and continue enjoying Pro features beyond {formatDate(endDate)}.
                </p>
                <button
                  onClick={handleReactivate}
                  disabled={reactivating}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {reactivating && <Loader2 className="w-5 h-5 animate-spin" />}
                  <span>{reactivating ? 'Reactivating...' : 'Reactivate Subscription'}</span>
                </button>
              </div>
            )}

            {/* Cancel Subscription Section */}
            {isPro && !cancelAtPeriodEnd && !cancelSuccess && (
              <div className="p-6 rounded-2xl bg-brand-dark-card border border-gray-700/50">
                {!showCancelConfirm ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Cancel subscription
                  </button>
                ) : (
                  <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30">
                    <p className="text-lg text-red-400 font-semibold mb-2">
                      Are you sure you want to cancel?
                    </p>
                    <p className="text-gray-400 mb-4">
                      Your subscription will remain active until {formatDate(endDate)}. After that, you'll be downgraded to the Free plan.
                    </p>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{cancelling ? 'Cancelling...' : 'Yes, cancel'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowCancelConfirm(false);
                          setCancelError(null);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-colors"
                      >
                        Keep subscription
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
