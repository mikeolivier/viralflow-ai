'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { VideoUpload } from '@/components/VideoUpload';
import { ProcessingProgress } from '@/components/ProcessingProgress';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { Redirect } from 'next/navigation';

type DashboardState = 'upload' | 'processing' | 'results';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [state, setState] = useState<DashboardState>('upload');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  const handleUploadComplete = (videoId: string) => {
    setCurrentVideoId(videoId);
    setState('processing');
    setError(null);
  };

  const handleProcessingComplete = () => {
    setState('results');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setState('upload');
  };

  const handleReset = () => {
    setState('upload');
    setCurrentVideoId(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">ViralFlow AI</h1>
              <p className="text-slate-400 mt-1">Welcome, {user?.username}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Plan: {user?.subscriptionTier}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-800 mt-2 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload State */}
        {state === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Your Video</h2>
              <p className="text-slate-600 mb-8">
                Upload a raw video clip and let ViralFlow AI transform it into a viral-ready masterpiece.
              </p>
              <VideoUpload
                onUploadComplete={handleUploadComplete}
                onError={handleError}
              />
            </div>
          </div>
        )}

        {/* Processing State */}
        {state === 'processing' && currentVideoId && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Processing Your Video</h2>
              <ProcessingProgress
                videoId={currentVideoId}
                onComplete={handleProcessingComplete}
                onError={handleError}
              />
            </div>
          </div>
        )}

        {/* Results State */}
        {state === 'results' && currentVideoId && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Your Results</h2>
            <ResultsDisplay videoId={currentVideoId} />
            <div className="mt-8 flex gap-4 justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
              >
                Process Another Video
              </button>
              <button className="px-6 py-2 border-2 border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                View History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
