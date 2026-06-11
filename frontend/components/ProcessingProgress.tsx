'use client';

import React, { useEffect, useState } from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { subscribeToVideoProgress, ProgressUpdate } from '@/lib/socket';
import { apiClient } from '@/lib/api';

interface ProcessingProgressProps {
  videoId: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

interface ProcessingStep {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress: number;
}

export function ProcessingProgress({
  videoId,
  onComplete,
  onError,
}: ProcessingProgressProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { name: 'Downloading video', status: 'pending', progress: 0 },
    { name: 'Analyzing content', status: 'pending', progress: 0 },
    { name: 'Transcoding video', status: 'pending', progress: 0 },
    { name: 'Applying effects', status: 'pending', progress: 0 },
    { name: 'Uploading result', status: 'pending', progress: 0 },
  ]);

  const [overallProgress, setOverallProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('Initializing...');
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const handleProgressUpdate = (update: ProgressUpdate) => {
      setOverallProgress(update.progress);
      setCurrentStatus(update.status);

      // Update steps based on progress
      updateSteps(update.progress, update.status);

      if (update.progress === 100) {
        setIsComplete(true);
        onComplete();
      }
    };

    const pollStatus = async () => {
      try {
        const response = await apiClient.getVideoStatus(videoId);
        if (response.video.status === 'completed') {
          setIsComplete(true);
          setOverallProgress(100);
          onComplete();
        } else if (response.video.status === 'failed') {
          setHasError(true);
          onError(response.video.errorMessage || 'Processing failed');
        }
      } catch (error) {
        console.error('Failed to poll status:', error);
      }
    };

    // Subscribe to real-time updates
    unsubscribe = subscribeToVideoProgress(videoId, handleProgressUpdate);

    // Poll status every 5 seconds as fallback
    pollInterval = setInterval(pollStatus, 5000);

    return () => {
      if (unsubscribe) unsubscribe();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [videoId, onComplete, onError]);

  const updateSteps = (progress: number, status: string) => {
    setSteps((prevSteps) => {
      const newSteps = [...prevSteps];

      if (progress >= 15) newSteps[0].status = 'completed';
      if (progress >= 25) newSteps[1].status = 'active';
      if (progress >= 40) newSteps[1].status = 'completed';
      if (progress >= 65) newSteps[2].status = 'active';
      if (progress >= 65) newSteps[2].status = 'completed';
      if (progress >= 90) newSteps[3].status = 'active';
      if (progress >= 95) newSteps[3].status = 'completed';
      if (progress >= 100) newSteps[4].status = 'completed';

      return newSteps;
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Overall Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-slate-900">Processing Video</h3>
          <span className="text-sm font-mono text-slate-600">{overallProgress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-sm text-slate-600 mt-2">{currentStatus}</p>
      </div>

      {/* Processing Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200"
          >
            <div className="flex-shrink-0">
              {step.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
              )}
              {step.status === 'active' && (
                <Loader className="w-5 h-5 text-cyan-500 animate-spin" />
              )}
              {step.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {step.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  step.status === 'completed'
                    ? 'text-green-700'
                    : step.status === 'active'
                    ? 'text-cyan-700'
                    : 'text-slate-600'
                }`}
              >
                {step.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Error State */}
      {hasError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            Processing failed. Please try again or contact support.
          </p>
        </div>
      )}

      {/* Complete State */}
      {isComplete && !hasError && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">
            ✓ Video processing complete! Your edited video is ready.
          </p>
        </div>
      )}
    </div>
  );
}
