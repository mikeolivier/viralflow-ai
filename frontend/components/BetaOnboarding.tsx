'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, Mail } from 'lucide-react';
import { api } from '@/lib/api';

interface BetaOnboardingProps {
  onComplete?: () => void;
}

export function BetaOnboarding({ onComplete }: BetaOnboardingProps) {
  const [step, setStep] = useState<'invite' | 'feedback' | 'complete'>('invite');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleJoinBeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/beta/join', { inviteCode });
      setSuccess(true);
      setStep('feedback');
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join beta program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Step 1: Invite Code */}
        {step === 'invite' && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Join ViralFlow AI Beta
              </h1>
              <p className="text-slate-600">
                Enter your invite code to get early access
              </p>
            </div>

            <form onSubmit={handleJoinBeta} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC12345"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={loading}
                  maxLength={8}
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">Welcome to ViralFlow AI!</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !inviteCode}
                className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 disabled:bg-slate-300 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Beta Program'
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-4">
              Don't have an invite code? Check your email
            </p>
          </div>
        )}

        {/* Step 2: Feedback */}
        {step === 'feedback' && (
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              You're In!
            </h1>
            <p className="text-slate-600 mb-6">
              Welcome to the ViralFlow AI beta program. We're excited to have you on board!
            </p>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-slate-900 mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Upload your first video</li>
                <li>✓ Watch the AI magic happen</li>
                <li>✓ Share your feedback with us</li>
                <li>✓ Help shape the future of video editing</li>
              </ul>
            </div>

            <button
              onClick={onComplete}
              className="w-full px-6 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
            >
              Start Creating
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
