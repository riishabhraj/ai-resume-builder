'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut, Sparkles, Crown, Settings, CreditCard, Calendar, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { hasProFeatures, hasProPlusFeatures, FREE_TIER_LIMITS } from '@/lib/razorpay';
import SubscriptionModal from './SubscriptionModal';

interface ProfileDropdownProps {
  onSignOut?: () => void;
}

export default function ProfileDropdown({ onSignOut }: ProfileDropdownProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    tier,
    status,
    endDate,
    cancelAtPeriodEnd,
    resumesCreated,
    reviewsUsed,
    fetchSubscription,
    initialized,
    loading,
    error
  } = useSubscriptionStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch subscription on mount
  useEffect(() => {
    if (user && !initialized) {
      fetchSubscription();
    }
  }, [user, initialized, fetchSubscription]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setShowMenu(false);
    if (onSignOut) {
      onSignOut();
    }
  };

  const isPro = hasProFeatures(tier);
  const isProPlus = hasProPlusFeatures(tier);
  const isActive = status === 'active';
  const isCancelled = cancelAtPeriodEnd;

  // Format end date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get plan display name
  const getPlanName = () => {
    if (isProPlus) return 'Pro Plus';
    if (isPro) return 'Pro';
    return 'Free';
  };

  // Get user display name
  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name ||
           user?.user_metadata?.name ||
           user?.email?.split('@')[0]?.split('.').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') ||
           'User';
  };

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity p-1 rounded-full"
        >
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border-2 border-brand-purple/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="hidden sm:block text-brand-white text-sm font-medium">
            {getUserDisplayName()}
          </span>
          {isPro && (
            <span className={`hidden sm:flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              isProPlus
                ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white'
                : 'bg-gradient-to-r from-brand-cyan to-brand-purple text-white'
            }`}>
              {isProPlus ? <Crown className="w-2.5 h-2.5 mr-0.5" /> : <Sparkles className="w-2.5 h-2.5 mr-0.5" />}
              {isProPlus ? 'PLUS' : 'PRO'}
            </span>
          )}
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-72 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/50 z-50 overflow-hidden">
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                {/* Plan Badge */}
                <div className={`ml-2 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center ${
                  isProPlus
                    ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white'
                    : isPro
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-purple text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {isProPlus && <Crown className="w-3 h-3 mr-1" />}
                  {isPro && !isProPlus && <Sparkles className="w-3 h-3 mr-1" />}
                  {getPlanName()}
                </div>
              </div>

              {/* Subscription Status */}
              {loading ? (
                <div className="mt-2 pt-2 border-t border-gray-700/50">
                  <div className="flex items-center text-xs text-gray-500">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Loading subscription...
                  </div>
                </div>
              ) : error ? (
                <div className="mt-2 pt-2 border-t border-gray-700/50">
                  <div className="flex items-center text-xs text-red-400">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Failed to load
                  </div>
                </div>
              ) : isPro && endDate ? (
                <div className="mt-2 pt-2 border-t border-gray-700/50">
                  {isCancelled ? (
                    <p className="text-xs text-amber-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Cancels {formatDate(endDate)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Renews {formatDate(endDate)}
                    </p>
                  )}
                </div>
              ) : null}

              {/* Usage Stats for Free Users */}
              {!isPro && (
                <div className="mt-2 pt-2 border-t border-gray-700/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Resumes</span>
                    <span className="text-gray-300">
                      {resumesCreated}/{FREE_TIER_LIMITS.resumes_per_month} this month
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">AI Reviews</span>
                    <span className="text-gray-300">
                      {reviewsUsed}/{FREE_TIER_LIMITS.reviews_per_month} this month
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="py-1">
              {/* Manage Subscription / Upgrade */}
              {isPro ? (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowSubscriptionModal(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Manage Subscription</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push('/pricing');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center space-x-2 text-brand-pink">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-medium">Upgrade to Pro</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 ml-6">
                    <span>From $8/month</span>
                    <span className="text-brand-cyan">Save 33%</span>
                  </div>
                </button>
              )}

              <div className="border-t border-gray-700/50 my-1"></div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </>
  );
}
