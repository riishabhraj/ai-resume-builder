'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Crown,
  Sparkles,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Receipt,
  ArrowUpRight,
  XCircle,
} from 'lucide-react';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { hasProFeatures, hasProPlusFeatures, SUBSCRIPTION_PLANS } from '@/lib/razorpay';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const router = useRouter();
  const {
    tier,
    startDate,
    endDate,
    cancelAtPeriodEnd,
    transactions,
    cancelSubscription,
    reactivateSubscription,
    fetchSubscription,
    error: storeError,
    clearError,
  } = useSubscriptionStore();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [reactivateSuccess, setReactivateSuccess] = useState(false);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowCancelConfirm(false);
      setCancelError(null);
      setCancelSuccess(false);
      setReactivateSuccess(false);
      clearError();
    }
  }, [isOpen, clearError]);

  if (!isOpen) return null;

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
        // Refresh subscription data
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

    try {
      const result = await reactivateSubscription();

      if (result.success) {
        setReactivateSuccess(true);
        setCancelSuccess(false);
        // Refresh subscription data
        await fetchSubscription();
      } else {
        // Set error from result
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-brand-dark-card rounded-2xl shadow-2xl border border-brand-purple/30 flex flex-col max-h-[90vh] overflow-hidden z-[10000]">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-brand-purple/20 bg-gradient-to-r from-brand-dark-surface to-brand-dark-card flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isProPlus ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
            ) : isPro ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isProPlus ? 'Pro Plus' : isPro ? 'Pro' : 'Free'} Plan
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                {isPro ? 'Subscription Management' : 'Your current plan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Subscription Status Card */}
          {isPro && (
              <div className={`p-4 rounded-xl border ${
                cancelAtPeriodEnd
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-brand-green/10 border-brand-green/30'
              }`}>
                <div className="flex items-start space-x-3">
                  {cancelAtPeriodEnd ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-semibold ${cancelAtPeriodEnd ? 'text-amber-400' : 'text-brand-green'}`}>
                      {cancelAtPeriodEnd ? 'Subscription Cancelled' : 'Active Subscription'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
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
              <div className="p-4 rounded-xl bg-brand-green/10 border border-brand-green/30">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-brand-green">Subscription Cancelled</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Your subscription has been cancelled. You'll retain Pro access until the end of your billing period.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reactivate Success Message */}
            {reactivateSuccess && (
              <div className="p-4 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-brand-cyan">Subscription Reactivated</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Your subscription has been reactivated and will automatically renew on {formatDate(endDate)}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Store Error Message */}
            {storeError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-400">Error</p>
                    <p className="text-sm text-gray-400 mt-1">{storeError}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Plan Details */}
            {planDetails && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Plan Details
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Plan</p>
                    <p className="text-xs sm:text-sm font-semibold text-white">{planDetails.name}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Price</p>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {formatAmount(planDetails.amount, planDetails.currency)}
                      <span className="text-gray-400 font-normal text-[10px] sm:text-xs">
                        /{planDetails.interval === 1 ? 'mo' : `${planDetails.interval}mo`}
                      </span>
                    </p>
                    {planDetails.interval > 1 && (
                      <p className="text-[10px] sm:text-xs text-brand-cyan mt-0.5">
                        {formatAmount(planDetails.amount / planDetails.interval, planDetails.currency)}/month
                      </p>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Started</p>
                    <p className="text-xs sm:text-sm font-semibold text-white break-words">{formatDate(startDate)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">{cancelAtPeriodEnd ? 'Ends' : 'Renews'}</p>
                    <p className="text-xs sm:text-sm font-semibold text-white break-words">{formatDate(endDate)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Billing History */}
            {transactions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Billing History
                </h3>
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.status === 'captured' || tx.status === 'paid'
                            ? 'bg-brand-green/20'
                            : 'bg-red-500/20'
                        }`}>
                          {tx.status === 'captured' || tx.status === 'paid' ? (
                            <Receipt className="w-4 h-4 text-brand-green" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-white">
                            {tx.plan_type === 'pro_plus_6month' ? 'Pro Plus' : 'Pro Monthly'}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {new Date(tx.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs sm:text-sm font-semibold ${
                          tx.status === 'captured' || tx.status === 'paid' ? 'text-white' : 'text-red-400'
                        }`}>
                          {formatAmount(tx.amount, tx.currency)}
                        </p>
                        <p className={`text-[10px] ${
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
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-purple/20 to-brand-pink/20 border border-brand-purple/30">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">Upgrade to Pro</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Get unlimited resumes, AI reviews, and premium features starting at $12/month.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        router.push('/pricing');
                      }}
                      className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center space-x-1"
                    >
                      <span>View Plans</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reactivate Subscription Section */}
            {isPro && cancelAtPeriodEnd && !reactivateSuccess && (
              <div className="pt-2">
                <div className="p-4 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30">
                  <p className="text-sm text-brand-cyan font-semibold mb-2">
                    Reactivate Your Subscription
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Changed your mind? Reactivate your subscription and continue enjoying Pro features beyond {formatDate(endDate)}.
                  </p>
                  <button
                    onClick={handleReactivate}
                    disabled={reactivating}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {reactivating && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{reactivating ? 'Reactivating...' : 'Reactivate Subscription'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Cancel Subscription Section */}
            {isPro && !cancelAtPeriodEnd && !cancelSuccess && (
              <div className="pt-2">
                {!showCancelConfirm ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Cancel subscription
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-400 font-semibold mb-2">
                      Are you sure you want to cancel?
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Your subscription will remain active until {formatDate(endDate)}. After that, you'll be downgraded to the Free plan.
                    </p>
                    {cancelError && (
                      <p className="text-xs text-red-400 mb-3">{cancelError}</p>
                    )}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{cancelling ? 'Cancelling...' : 'Yes, cancel'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowCancelConfirm(false);
                          setCancelError(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm font-semibold hover:bg-gray-600 transition-colors"
                      >
                        Keep subscription
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-brand-purple/20 bg-gradient-to-r from-brand-dark-surface to-brand-dark-card">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
