'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, Mail } from 'lucide-react';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [position, setPosition] = useState<number | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      setSuccess(true);
      setPosition(data.position || null);
      setAlreadyExists(data.alreadyExists || false);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-green/20 to-brand-green/10 border-2 border-brand-green/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="w-6 h-6 text-brand-green" />
            <h3 className="text-lg font-bold text-brand-white">
              You're on the waitlist!
            </h3>
          </div>
          <p className="text-brand-gray-text text-sm">
            {alreadyExists 
              ? `You're already on the waitlist! You're #${position} in line.`
              : position 
                ? `You're #${position} on the waitlist. We'll notify you when we launch!`
                : "We'll notify you when we launch!"
            }
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setError('');
              setPosition(null);
              setAlreadyExists(false);
            }}
            className="mt-4 text-sm text-brand-green-light hover:text-brand-green transition-colors"
          >
            Join another email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-gray-text" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={loading}
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-brand-dark-card/50 border-2 border-brand-purple/30 focus:border-brand-purple/60 text-brand-white placeholder-brand-gray-text focus:outline-none transition-all backdrop-blur-sm disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl glow-purple border border-brand-purple-light/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Joining...</span>
            </>
          ) : (
            <span>Join Waitlist</span>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
      )}
    </form>
  );
}


