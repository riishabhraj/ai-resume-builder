'use client';

import { X, Sparkles, Check, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'resumes' | 'reviews';
  currentCount: number;
  maxCount: number;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  limitType,
  currentCount,
  maxCount,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const messages = {
    resumes: {
      title: 'Resume Limit Reached',
      description: `You've created ${currentCount}/${maxCount} resumes this month`,
      features: [
        'Unlimited resumes',
        'Unlimited AI reviews',
        'AI resume tailoring',
        'Cover letter generator',
        'Priority support',
      ],
    },
    reviews: {
      title: 'Review Limit Reached',
      description: `You've used ${currentCount}/${maxCount} AI reviews this month`,
      features: [
        'Unlimited AI reviews',
        'Detailed ATS breakdown',
        'Keyword gap analysis',
        'AI bullet enhancement',
        'Priority processing',
      ],
    },
  };

  const message = messages[limitType];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-brand-navy/95 to-brand-dark-bg/95 backdrop-blur-xl rounded-3xl border-2 border-brand-purple/30 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-brand-purple/20 transition-colors"
        >
          <X className="w-5 h-5 text-brand-gray-text" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-pink mb-4 shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-brand-white mb-2">
              {message.title}
            </h2>
            <p className="text-brand-gray-text text-lg">
              {message.description}
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Pro Plan */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-purple/10 to-brand-pink/10 border-2 border-brand-cyan/30">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-xl font-bold text-brand-white">Pro</h3>
                <span className="ml-auto text-brand-cyan font-bold">₹12/mo</span>
              </div>
              <ul className="space-y-3 mb-6">
                {message.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-brand-cyan mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block w-full py-3 px-6 rounded-xl text-center font-bold text-white bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-pink hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Upgrade to Pro
                <ArrowRight className="inline-block w-4 h-4 ml-2" />
              </Link>
            </div>

            {/* Pro Plus Plan */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-pink/10 to-brand-purple/10 border-2 border-brand-pink/30 relative">
              <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-brand-purple to-brand-pink text-white text-xs font-bold">
                Save 33%
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <Crown className="w-5 h-5 text-brand-pink" />
                <h3 className="text-xl font-bold text-brand-white">Pro Plus</h3>
                <span className="ml-auto text-brand-pink font-bold">₹8/mo</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-brand-pink mt-0.5 flex-shrink-0" />
                  <span className="text-brand-white text-sm font-semibold">Everything in Pro</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-brand-pink mt-0.5 flex-shrink-0" />
                  <span className="text-brand-gray-text text-sm">1 free human review</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-brand-pink mt-0.5 flex-shrink-0" />
                  <span className="text-brand-gray-text text-sm">Early access features</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-brand-pink mt-0.5 flex-shrink-0" />
                  <span className="text-brand-gray-text text-sm">Locked-in pricing</span>
                </li>
              </ul>
              <Link
                href="/pricing"
                className="block w-full py-3 px-6 rounded-xl text-center font-bold text-white bg-gradient-to-r from-brand-purple to-brand-pink hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Get Pro Plus
                <ArrowRight className="inline-block w-4 h-4 ml-2" />
              </Link>
              <p className="text-center text-brand-gray-text text-xs mt-2">
                Billed ₹48 every 6 months
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-brand-gray-text text-sm mb-2">
              ✨ Secure payment • Cancel anytime • Instant access
            </p>
            <button
              onClick={onClose}
              className="text-brand-cyan hover:text-brand-cyan-light text-sm font-medium transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

