/**
 * Context-Aware Video Processor
 * 
 * Orchestrates the complete context-aware editing pipeline:
 * 1. Scene Detection - Analyze video frames for objects, poses, expressions
 * 2. Moment Classification - Identify specific moment types (funny, reaction, etc.)
 * 3. Effect Sequencing - Generate effect sequences for each moment
 * 4. FFmpeg Integration - Apply effects to video
 * 
 * This is the orchestrator that ties everything together.
 */

import { sceneDetectionService, SceneAnalysis } from './sceneDetection';
import { momentClassifierService, MomentClassification } from './momentClassifier';
import { effectSequencerService, EffectSequence } from './effectSequencer';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface ContextAwareAnalysis {
  videoPath: string;
  duration: number;
  fps: number;
  sceneAnalysis: SceneAnalysis;
  moments: MomentClassification[];
  effectSequences: EffectSequence[];
  summary: {
    totalMomentsDetected: number;
    averageConfidence: number;
    recommendedEffects: string[];
    editingStrategy: string;
  };
}

export interface ProcessingResult {
  success: boolean;
  videoPath: string;
  outputPath: string;
  analysis: ContextAwareAnalysis;
  processingTime: number;
  message: string;
}

/**
 * Context-Aware Video Processor
 * 
 * Orchestrates the complete context-aware editing workflow.
 */
export class ContextAwareProcessor {
  /**
   * Analyze video for context-aware editing opportunities
   */
  async analyzeVideo(videoPath: string): Promise<ContextAwareAnalysis> {
    console.log(`[ContextAware] Starting analysis of ${videoPath}`);

    // Step 1: Get video metadata
    const { duration, fps } = await this.getVideoMetadata(videoPath);
    console.log(`[ContextAware] Video duration: ${duration}s, FPS: ${fps}`);

    // Step 2: Scene detection
    console.log('[ContextAware] Running scene detection...');
    const sceneAnalysis = await sceneDetectionService.analyzeVideo(videoPath, fps);
    console.log(`[ContextAware] Detected ${sceneAnalysis.scenes.length} key frames`);

    // Step 3: Moment classification
    console.log('[ContextAware] Classifying moments...');
    const moments = momentClassifierService.classifyMoments(sceneAnalysis);
    console.log(`[ContextAware] Found ${moments.length} moments`);

    // Step 4: Effect sequencing
    console.log('[ContextAware] Generating effect sequences...');
    let effectSequences = effectSequencerService.generateAllEffectSequences(moments);
    effectSequences = effectSequencerService.optimizeSequences(effectSequences);
    console.log(`[ContextAware] Generated ${effectSequences.length} effect sequences`);

    // Step 5: Calculate summary
    const averageConfidence = moments.length > 0
      ? moments.reduce((sum, m) => sum + m.confidence, 0) / moments.length
      : 0;

    const recommendedEffects = Array.from(
      new Set(
        effectSequences
          .flatMap(seq => seq.effects)
          .map(effect => effect.name)
      )
    );

    const editingStrategy = this.generateEditingStrategy(moments);

    return {
      videoPath,
      duration,
      fps,
      sceneAnalysis,
      moments,
      effectSequences,
      summary: {
        totalMomentsDetected: moments.length,
        averageConfidence,
        recommendedEffects,
        editingStrategy,
      },
    };
  }

  /**
   * Process video with context-aware editing
   */
  async processVideo(videoPath: string, outputPath: string): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      // Analyze video
      const analysis = await this.analyzeVideo(videoPath);

      // Generate FFmpeg filter graph
      const filterGraph = effectSequencerService.exportToFFmpegFilterGraph(
        analysis.effectSequences
      );

      // Apply effects using FFmpeg
      if (analysis.effectSequences.length > 0) {
        await this.applyEffectsWithFFmpeg(videoPath, outputPath, filterGraph);
      } else {
        // No effects, just copy video
        await this.copyVideo(videoPath, outputPath);
      }

      const processingTime = (Date.now() - startTime) / 1000;

      return {
        success: true,
        videoPath,
        outputPath,
        analysis,
        processingTime,
        message: `Successfully processed video with ${analysis.moments.length} moments detected`,
      };
    } catch (error) {
      const processingTime = (Date.now() - startTime) / 1000;

      return {
        success: false,
        videoPath,
        outputPath,
        analysis: null as any,
        processingTime,
        message: `Error processing video: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Get video metadata (duration, FPS, resolution)
   */
  private getVideoMetadata(videoPath: string): Promise<{ duration: number; fps: number }> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration,stream=r_frame_rate',
        '-of', 'default=noprint_wrappers=1:nokey=1:noprint_wrappers=1',
        videoPath,
      ]);

      let output = '';

      ffprobe.stdout.on('data', (data) => {
        output += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code === 0) {
          const lines = output.trim().split('\n');
          const duration = parseFloat(lines[0]) || 0;
          const fpsStr = lines[1] || '30/1';
          const [num, den] = fpsStr.split('/').map(Number);
          const fps = num / den;

          resolve({ duration, fps });
        } else {
          reject(new Error('ffprobe failed'));
        }
      });
    });
  }

  /**
   * Apply effects to video using FFmpeg
   */
  private applyEffectsWithFFmpeg(
    inputPath: string,
    outputPath: string,
    filterGraph: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-i', inputPath,
        '-vf', filterGraph || 'copy',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-y',
        outputPath,
      ];

      const ffmpeg = spawn('ffmpeg', args);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });

      ffmpeg.on('error', reject);
    });
  }

  /**
   * Copy video without effects
   */
  private copyVideo(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-c', 'copy',
        '-y',
        outputPath,
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg copy failed with code ${code}`));
        }
      });

      ffmpeg.on('error', reject);
    });
  }

  /**
   * Generate editing strategy description
   */
  private generateEditingStrategy(moments: MomentClassification[]): string {
    if (moments.length === 0) {
      return 'No significant moments detected. Video appears to be static content.';
    }

    const momentTypes = moments.map(m => m.type);
    const uniqueTypes = Array.from(new Set(momentTypes));

    let strategy = `Detected ${moments.length} moments: `;
    strategy += uniqueTypes.map(type => {
      const count = momentTypes.filter(t => t === type).length;
      return `${count} ${type}`;
    }).join(', ');

    strategy += '. Applied context-aware effects to amplify engagement and entertainment value.';

    return strategy;
  }

  /**
   * Get detailed report of detected moments
   */
  getDetailedReport(analysis: ContextAwareAnalysis): string {
    let report = '# Context-Aware Video Analysis Report\n\n';

    report += `## Video Information\n`;
    report += `- Duration: ${analysis.duration.toFixed(2)}s\n`;
    report += `- FPS: ${analysis.fps.toFixed(2)}\n`;
    report += `- Total Frames Analyzed: ${analysis.sceneAnalysis.totalFrames}\n\n`;

    report += `## Moments Detected (${analysis.moments.length})\n`;
    analysis.moments.forEach((moment, index) => {
      report += `\n### Moment ${index + 1}: ${moment.type.toUpperCase()}\n`;
      report += `- Time: ${moment.startTime.toFixed(2)}s - ${moment.endTime.toFixed(2)}s\n`;
      report += `- Confidence: ${(moment.confidence * 100).toFixed(1)}%\n`;
      report += `- Description: ${moment.description}\n`;
      report += `- Effects Applied: ${moment.suggestedEffects.join(', ')}\n`;
    });

    report += `\n## Summary\n`;
    report += `- Total Moments: ${analysis.summary.totalMomentsDetected}\n`;
    report += `- Average Confidence: ${(analysis.summary.averageConfidence * 100).toFixed(1)}%\n`;
    report += `- Editing Strategy: ${analysis.summary.editingStrategy}\n`;

    return report;
  }
}

export const contextAwareProcessor = new ContextAwareProcessor();
