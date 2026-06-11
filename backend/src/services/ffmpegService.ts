import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const logger = pino();

// Set FFmpeg and FFprobe paths
const ffmpegPath = process.env.FFMPEG_PATH || '/usr/bin/ffmpeg';
const ffprobePath = process.env.FFPROBE_PATH || '/usr/bin/ffprobe';

if (fs.existsSync(ffmpegPath)) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

if (fs.existsSync(ffprobePath)) {
  ffmpeg.setFfprobePath(ffprobePath);
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  hasAudio: boolean;
  audioCodec?: string;
  videoCodec?: string;
}

export interface ProcessingOptions {
  vfxStyle?: 'cinematic' | 'vibrant' | 'minimal' | 'dramatic';
  captionFont?: 'modern' | 'elegant' | 'playful' | 'minimal';
  outputFormat?: 'mp4' | 'webm';
  quality?: 'low' | 'medium' | 'high';
}

/**
 * Get video metadata
 */
export function getVideoMetadata(inputPath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        logger.error(`Failed to get metadata for ${inputPath}: ${err.message}`);
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      const audioStream = metadata.streams.find((s) => s.codec_type === 'audio');

      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        fps: videoStream.r_frame_rate ? eval(videoStream.r_frame_rate) : 30,
        bitrate: metadata.format.bit_rate || 0,
        hasAudio: !!audioStream,
        audioCodec: audioStream?.codec_name,
        videoCodec: videoStream.codec_name,
      });
    });
  });
}

/**
 * Transcode video to MP4
 */
export function transcodeToMp4(
  inputPath: string,
  outputPath: string,
  options: ProcessingOptions = {},
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const qualitySettings = {
      low: { videoBitrate: '500k', audioBitrate: '64k' },
      medium: { videoBitrate: '2000k', audioBitrate: '128k' },
      high: { videoBitrate: '5000k', audioBitrate: '192k' },
    };

    const quality = options.quality || 'medium';
    const settings = qualitySettings[quality];

    let command = ffmpeg(inputPath)
      .outputOptions([
        `-b:v ${settings.videoBitrate}`,
        `-b:a ${settings.audioBitrate}`,
        '-c:v libx264',
        '-preset medium',
        '-c:a aac',
      ])
      .output(outputPath);

    if (onProgress) {
      command = command.on('progress', (progress) => {
        const percent = Math.min(Math.round(progress.percent), 100);
        onProgress(percent);
      });
    }

    command
      .on('end', () => {
        logger.info(`Transcoding completed: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        logger.error(`Transcoding failed: ${err.message}`);
        reject(err);
      })
      .run();
  });
}

/**
 * Apply VFX effects to video
 */
export function applyVFXEffects(
  inputPath: string,
  outputPath: string,
  vfxStyle: 'cinematic' | 'vibrant' | 'minimal' | 'dramatic' = 'cinematic',
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // VFX filter chains for different styles
    const filterChains: Record<string, string> = {
      cinematic: 'eq=brightness=0.05:contrast=1.2,scale=1920:1080:force_original_aspect_ratio=decrease',
      vibrant:
        'eq=saturation=1.5:brightness=0.05,scale=1920:1080:force_original_aspect_ratio=decrease',
      minimal: 'scale=1920:1080:force_original_aspect_ratio=decrease',
      dramatic:
        'eq=brightness=-0.1:contrast=1.5,scale=1920:1080:force_original_aspect_ratio=decrease',
    };

    const filters = filterChains[vfxStyle] || filterChains.cinematic;

    let command = ffmpeg(inputPath)
      .videoFilters(filters)
      .outputOptions(['-c:v libx264', '-preset medium', '-c:a aac'])
      .output(outputPath);

    if (onProgress) {
      command = command.on('progress', (progress) => {
        const percent = Math.min(Math.round(progress.percent), 100);
        onProgress(percent);
      });
    }

    command
      .on('end', () => {
        logger.info(`VFX effects applied: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        logger.error(`VFX application failed: ${err.message}`);
        reject(err);
      })
      .run();
  });
}

/**
 * Add captions to video
 */
export function addCaptions(
  inputPath: string,
  outputPath: string,
  subtitlePath: string,
  captionFont: 'modern' | 'elegant' | 'playful' | 'minimal' = 'modern',
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Font styles for captions
    const fontStyles: Record<string, string> = {
      modern: 'fontsize=24:fontcolor=white:borderw=2:bordercolor=black',
      elegant: 'fontsize=28:fontcolor=white:borderw=3:bordercolor=black:font=Arial',
      playful: 'fontsize=26:fontcolor=yellow:borderw=2:bordercolor=black',
      minimal: 'fontsize=20:fontcolor=white:borderw=0',
    };

    const fontStyle = fontStyles[captionFont] || fontStyles.modern;
    const subtitleFilter = `subtitles='${subtitlePath}':${fontStyle}`;

    let command = ffmpeg(inputPath)
      .videoFilters(subtitleFilter)
      .outputOptions(['-c:v libx264', '-preset medium', '-c:a aac'])
      .output(outputPath);

    if (onProgress) {
      command = command.on('progress', (progress) => {
        const percent = Math.min(Math.round(progress.percent), 100);
        onProgress(percent);
      });
    }

    command
      .on('end', () => {
        logger.info(`Captions added: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        logger.error(`Caption addition failed: ${err.message}`);
        reject(err);
      })
      .run();
  });
}

/**
 * Extract audio from video
 */
export function extractAudio(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .outputOptions(['-q:a 0', '-map a'])
      .on('end', () => {
        logger.info(`Audio extracted: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        logger.error(`Audio extraction failed: ${err.message}`);
        reject(err);
      })
      .run();
  });
}

/**
 * Generate video thumbnail
 */
export function generateThumbnail(
  inputPath: string,
  outputPath: string,
  timestamp: string = '00:00:01'
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [timestamp],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
      })
      .on('end', () => {
        logger.info(`Thumbnail generated: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        logger.error(`Thumbnail generation failed: ${err.message}`);
        reject(err);
      });
  });
}
