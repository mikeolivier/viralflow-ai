'use client';

import React, { useEffect, useState } from 'react';
import { Download, Share2, Sparkles, Zap, Eye, MessageCircle, CheckCircle, Brain } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface EditingPattern {
  name: string;
  description: string;
  effects: string[];
  confidence: number;
}

interface ResultsDisplayProps {
  videoId: string;
}

export function ResultsDisplay({ videoId }: ResultsDisplayProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getVideoResult(videoId);
        setResult(response.result);
      } catch (err) {
        setError(apiClient.getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [videoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Analyzing your video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  // Mock editing patterns detected
  const editingPatterns: EditingPattern[] = [
    {
      name: 'Funny Moment Detected',
      description: 'AI detected a comedic moment and applied proven funny-moment editing patterns',
      effects: ['Freeze frame', 'Zoom in', 'Meme sound', 'Big head effect'],
      confidence: 92,
    },
    {
      name: 'Reaction Moment Detected',
      description: 'AI detected an emotional reaction and applied engagement-maximizing effects',
      effects: ['Zoom', 'Sound effect', 'Slow motion', 'Eye zoom'],
      confidence: 87,
    },
    {
      name: 'Transition Applied',
      description: 'AI found a natural cut point and applied a seamless transition',
      effects: ['Smooth morph', 'Music sync', 'Flash transition'],
      confidence: 94,
    },
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-cyan-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceBgColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-50 border-green-200';
    if (confidence >= 75) return 'bg-cyan-50 border-cyan-200';
    if (confidence >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-orange-50 border-orange-200';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Success Header */}
      <div className="p-8 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <h2 className="text-3xl font-bold text-slate-900">Your Video is Ready!</h2>
        </div>
        <p className="text-slate-700 text-lg">
          ViralFlow AI analyzed your footage and applied intelligent editing patterns. Here's what was detected and edited:
        </p>
      </div>

      {/* Editing Patterns Applied */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6 text-cyan-500" />
          Editing Patterns Applied
        </h3>

        <div className="space-y-4">
          {editingPatterns.map((pattern, index) => (
            <div
              key={index}
              className={`p-6 border-2 rounded-lg ${getConfidenceBgColor(pattern.confidence)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-1">{pattern.name}</h4>
                  <p className="text-slate-700">{pattern.description}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getConfidenceColor(pattern.confidence)}`}>
                    {pattern.confidence}%
                  </p>
                  <p className="text-xs text-slate-600">Confidence</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {pattern.effects.map((effect, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white border border-slate-300 rounded-full text-sm font-medium text-slate-700"
                  >
                    ✓ {effect}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Statistics */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Video Analysis</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Duration', value: '45 sec', icon: Eye },
            { label: 'Scenes Detected', value: '8', icon: Sparkles },
            { label: 'Moments Optimized', value: '3', icon: Zap },
            { label: 'Effects Applied', value: '12', icon: CheckCircle },
            { label: 'Processing Time', value: '2.3 min', icon: MessageCircle },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5 text-cyan-500" />
                  <p className="text-xs font-medium text-slate-600">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Editing Impact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">Before</p>
            <div className="aspect-video bg-slate-300 rounded-lg flex items-center justify-center text-slate-600">
              Raw footage
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">After</p>
            <div className="aspect-video bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
              Professionally edited
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors">
          <Download className="w-5 h-5" />
          Download Video
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-cyan-500 text-cyan-600 rounded-lg font-medium hover:bg-cyan-50 transition-colors">
          <Share2 className="w-5 h-5" />
          Share Results
        </button>
      </div>

      {/* Next Steps */}
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">What's Next?</h3>
        <ul className="space-y-3">
          {[
            'Download your edited video and post it to your favorite platform',
            'Track how your audience responds to the professionally edited version',
            'Upload another video to continue building your content library',
            'Share your success story with the ViralFlow AI community',
          ].map((step, index) => (
            <li key={index} className="flex gap-3 text-sm text-slate-700">
              <span className="text-cyan-500 font-bold flex-shrink-0">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Feedback Section */}
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">How satisfied are you with the editing?</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              className="w-12 h-12 rounded-lg border-2 border-slate-300 hover:border-cyan-500 hover:bg-cyan-50 transition-colors font-medium text-slate-600 hover:text-cyan-600"
            >
              {rating}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-2">Your feedback helps us improve the AI editing patterns</p>
      </div>
    </div>
  );
}
