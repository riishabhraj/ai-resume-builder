'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { shouldRedirectToWaitlist } from '@/lib/waitlist-check';
import { Mail, Loader2, AlertCircle, CheckCircle, FileText } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check if we have a token (user clicked reset link)
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    // Check waitlist mode (only if not resetting password)
    if (!token && shouldRedirectToWaitlist()) {
      router.push('/waitlist');
      return;
    }

    if (token && type === 'recovery') {
      setIsResetting(true);
    }
  }, [token, type, router]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (isResetting) {
    return (
      <div className="min-h-screen animated-gradient aurora flex items-center justify-center px-4" data-theme="atsbuilder">
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo and Branding */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center shadow-xl glow-purple">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold gradient-text">ResuCraft</span>
          </div>

          <div className="glass rounded-2xl p-8 shadow-2xl border border-brand-purple/20">
            <h2 className="text-3xl font-bold text-center text-white mb-2">
              Reset Password
            </h2>
            <p className="text-center text-brand-gray-text mb-6">
              Enter your new password
            </p>

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center space-x-2 text-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center space-x-2 text-green-200">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Password reset successfully! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-gray-text mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-brand-dark-bg/50 border border-brand-purple/30 text-white placeholder-brand-gray-text focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-gray-text mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-brand-dark-bg/50 border border-brand-purple/30 text-white placeholder-brand-gray-text focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-pink hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl glow-purple border border-brand-purple-light/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <p className="text-center text-sm mt-4">
              <Link href="/sign-in" className="text-brand-purple-light hover:text-brand-purple font-semibold transition-colors">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient aurora flex items-center justify-center px-4" data-theme="atsbuilder">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Branding */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center shadow-xl glow-purple">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold gradient-text">ResuCraft</span>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl border border-brand-purple/20">
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            Reset Password
          </h2>
          <p className="text-center text-brand-gray-text mb-6">
            Enter your email address and we'll send you a link to reset your password
          </p>

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center space-x-2 text-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 rounded-xl bg-green-500/20 border border-green-500/50 text-green-200">
              <CheckCircle className="w-5 h-5 inline mr-2" />
              <span>
                Password reset email sent! Please check your inbox and follow the instructions.
              </span>
            </div>
          )}

          <form onSubmit={handleRequestReset} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-brand-gray-text mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-gray-text" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-brand-dark-bg/50 border border-brand-purple/30 text-white placeholder-brand-gray-text focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-pink hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl glow-purple border border-brand-purple-light/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-brand-gray-text">
            Remember your password?{' '}
            <Link href="/sign-in" className="text-brand-purple-light hover:text-brand-purple font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
