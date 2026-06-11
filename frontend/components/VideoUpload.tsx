'use client';

import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error: string | null;
  videoId: string | null;
}

interface VideoUploadProps {
  onUploadComplete: (videoId: string) => void;
  onError: (error: string) => void;
}

export function VideoUpload({ onUploadComplete, onError }: VideoUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    error: null,
    videoId: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  const SUPPORTED_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime'];

  const handleFileSelect = async (file: File) => {
    // Validate file
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      const error = 'Unsupported file format. Please upload MP4, WebM, or MOV files.';
      setUploadState({ status: 'error', progress: 0, error, videoId: null });
      onError(error);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const error = 'File size exceeds 500MB limit.';
      setUploadState({ status: 'error', progress: 0, error, videoId: null });
      onError(error);
      return;
    }

    try {
      setUploadState({ status: 'uploading', progress: 5, error: null, videoId: null });

      // Request presigned URL
      const uploadResponse = await apiClient.requestUploadUrl(file.name, file.size);
      const { upload, video } = uploadResponse;

      setUploadState((prev) => ({ ...prev, videoId: video.id, progress: 10 }));

      // Upload to S3
      await apiClient.uploadFileToS3(upload.url, file, (progress) => {
        setUploadState((prev) => ({
          ...prev,
          progress: 10 + Math.round(progress * 0.8),
        }));
      });

      setUploadState({
        status: 'success',
        progress: 100,
        error: null,
        videoId: video.id,
      });

      onUploadComplete(video.id);
    } catch (error) {
      const errorMessage = apiClient.getErrorMessage(error);
      setUploadState({
        status: 'error',
        progress: 0,
        error: errorMessage,
        videoId: null,
      });
      onError(errorMessage);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = true;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = false;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragOverRef.current
            ? 'border-cyan-400 bg-cyan-400/5'
            : 'border-slate-300 hover:border-cyan-400 hover:bg-cyan-400/5'
        } ${uploadState.status === 'uploading' ? 'opacity-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleInputChange}
          disabled={uploadState.status === 'uploading'}
          className="hidden"
        />

        {uploadState.status === 'idle' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Drop your video here
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              or click to browse (MP4, WebM, MOV up to 500MB)
            </p>
          </div>
        )}

        {uploadState.status === 'uploading' && (
          <div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
            <p className="text-sm text-slate-600">
              Uploading... {uploadState.progress}%
            </p>
          </div>
        )}

        {uploadState.status === 'success' && (
          <div>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-sm text-slate-600">
              Video uploaded successfully! Processing will start shortly.
            </p>
          </div>
        )}

        {uploadState.status === 'error' && (
          <div>
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-sm text-red-600 mb-4">{uploadState.error}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
