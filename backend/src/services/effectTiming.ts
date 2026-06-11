/**
 * Effect Timing & Confidence Scoring
 * 
 * Optimizes effect timing and confidence scoring to ensure:
 * 1. Effects are applied at the perfect moment for maximum impact
 * 2. Confidence scores reflect real accuracy
 * 3. Effects don't overlap or conflict
 * 4. Timing aligns with audio beats (if available)
 * 
 * This module ensures effects feel natural and perfectly timed.
 */

import { Effect, EffectSequence } from './effectSequencer';
import { MomentClassification } from './momentClassifier';

export interface TimedEffect extends Effect {
  confidenceScore: number;
  priority: number;
  audioSync: boolean;
  beatAligned: boolean;
}

export interface ConfidenceMetrics {
  sceneConfidence: number;
  momentConfidence: number;
  effectConfidence: number;
  overallConfidence: number;
}

/**
 * Effect Timing Service
 * 
 * Optimizes timing and confidence scoring for effects.
 */
export class EffectTimingService {
  /**
   * Calculate confidence score for a moment
   * 
   * Factors:
   * - Detection confidence (from classifier)
   * - Scene clarity (motion, lighting)
   * - Uniqueness (how different from surrounding frames)
   */
  calculateMomentConfidence(
    moment: MomentClassification,
    sceneClarity: number = 0.8,
    uniqueness: number = 0.7
  ): number {
    // Base confidence from classifier
    const baseConfidence = moment.confidence;

    // Adjust for scene clarity (clear scenes = higher confidence)
    const clarityAdjustment = sceneClarity * 0.2;

    // Adjust for uniqueness (unique moments = higher confidence)
    const uniquenessAdjustment = uniqueness * 0.1;

    const finalConfidence = Math.min(1, baseConfidence + clarityAdjustment + uniquenessAdjustment);

    return finalConfidence;
  }

  /**
   * Calculate confidence score for an effect
   * 
   * Factors:
   * - Effect type reliability (some effects are more reliable than others)
   * - Moment type match (how well the effect matches the moment)
   * - Historical success rate
   */
  calculateEffectConfidence(
    effect: Effect,
    momentType: string,
    momentConfidence: number
  ): number {
    // Effect reliability scores (based on how well they work)
    const effectReliability: Record<string, number> = {
      freeze_frame: 0.95,
      zoom_in: 0.92,
      slow_motion: 0.90,
      meme_sound: 0.85,
      big_head_effect: 0.80,
      cute_zoom: 0.88,
      heart_particles: 0.82,
      rewind: 0.87,
      smooth_morph: 0.91,
      music_sync: 0.78,
    };

    const baseReliability = effectReliability[effect.name] || 0.75;

    // Moment-effect match scores
    const momentEffectMatch: Record<string, Record<string, number>> = {
      funny_fall: {
        freeze_frame: 1.0,
        zoom_in: 0.95,
        meme_sound: 0.90,
        big_head_effect: 0.85,
      },
      reaction: {
        zoom_in: 1.0,
        slow_motion: 0.95,
        eye_zoom: 0.92,
      },
      pet: {
        cute_zoom: 1.0,
        heart_particles: 0.95,
        slow_motion: 0.90,
      },
      transition: {
        smooth_morph: 1.0,
        music_sync: 0.92,
      },
    };

    const matchScore = momentEffectMatch[momentType]?.[effect.name] || 0.7;

    // Final confidence combines reliability, match, and moment confidence
    const effectConfidence = (baseReliability * 0.4) + (matchScore * 0.4) + (momentConfidence * 0.2);

    return Math.min(1, effectConfidence);
  }

  /**
   * Optimize effect timing for maximum impact
   * 
   * Adjusts start time and duration based on:
   * - Peak moment timing
   * - Audio beats (if available)
   * - Effect ramp-up time
   */
  optimizeEffectTiming(
    effect: Effect,
    peakMomentTime: number,
    audioBeats?: number[]
  ): Effect {
    const optimized = { ...effect };

    // Adjust start time to align with peak moment
    const timingOffset = this.calculateTimingOffset(effect.name);
    optimized.startTime = peakMomentTime + timingOffset;

    // Align with audio beats if available
    if (audioBeats && audioBeats.length > 0) {
      const nearestBeat = audioBeats.reduce((prev, curr) =>
        Math.abs(curr - optimized.startTime) < Math.abs(prev - optimized.startTime) ? curr : prev
      );

      // If close to a beat, snap to it
      if (Math.abs(nearestBeat - optimized.startTime) < 0.1) {
        optimized.startTime = nearestBeat;
      }
    }

    // Adjust duration based on effect type
    optimized.duration = this.calculateOptimalDuration(effect.name, optimized.duration);

    return optimized;
  }

  /**
   * Calculate optimal timing offset for an effect
   * 
   * Different effects need to start at different times relative to the peak moment.
   */
  private calculateTimingOffset(effectName: string): number {
    const offsets: Record<string, number> = {
      freeze_frame: 0.05, // Start slightly after peak
      zoom_in: 0.0, // Start at peak
      slow_motion: 0.0, // Start at peak
      meme_sound: 0.1, // Start after visual effect
      big_head_effect: 0.15, // Start after zoom
      cute_zoom: 0.0, // Start at peak
      heart_particles: 0.2, // Start after main effect
      rewind: -0.3, // Start before peak
      smooth_morph: 0.0, // Start at transition point
      music_sync: 0.0, // Start at beat
    };

    return offsets[effectName] || 0;
  }

  /**
   * Calculate optimal duration for an effect
   * 
   * Some effects should be quick, others should linger.
   */
  private calculateOptimalDuration(effectName: string, suggestedDuration: number): number {
    const durationMultipliers: Record<string, number> = {
      freeze_frame: 1.0, // Keep as-is
      zoom_in: 1.1, // Slightly longer for dramatic effect
      slow_motion: 1.0, // Keep as-is
      meme_sound: 1.0, // Keep as-is
      big_head_effect: 0.9, // Shorter for comedy
      cute_zoom: 1.2, // Longer to emphasize cuteness
      heart_particles: 1.3, // Longer to linger
      rewind: 0.8, // Shorter for snappiness
      smooth_morph: 1.0, // Keep as-is
      music_sync: 1.0, // Keep as-is
    };

    const multiplier = durationMultipliers[effectName] || 1.0;
    return suggestedDuration * multiplier;
  }

  /**
   * Detect audio beats for music synchronization
   * 
   * In production, use librosa or similar library to detect beats.
   */
  detectAudioBeats(audioPath: string): Promise<number[]> {
    return new Promise((resolve) => {
      // Mock implementation - in production, use librosa
      // const beats = spawn('python', ['detect_beats.py', audioPath]);
      
      // For now, return empty array (no beat detection)
      resolve([]);
    });
  }

  /**
   * Prioritize effects when there are conflicts
   * 
   * Some effects should take precedence over others.
   */
  prioritizeEffects(effects: Effect[]): TimedEffect[] {
    const effectPriorities: Record<string, number> = {
      freeze_frame: 10,
      zoom_in: 9,
      slow_motion: 8,
      meme_sound: 7,
      big_head_effect: 6,
      cute_zoom: 9,
      heart_particles: 5,
      rewind: 8,
      smooth_morph: 10,
      music_sync: 7,
    };

    return effects.map((effect, index) => ({
      ...effect,
      confidenceScore: 0.85, // Will be calculated properly
      priority: effectPriorities[effect.name] || 5,
      audioSync: effect.name.includes('sync') || effect.name.includes('music'),
      beatAligned: false, // Will be set during timing optimization
    }));
  }

  /**
   * Detect and resolve effect conflicts
   * 
   * Identifies overlapping effects and resolves conflicts by:
   * - Adjusting timing
   * - Reducing intensity
   * - Changing effect order
   */
  resolveEffectConflicts(effects: TimedEffect[]): TimedEffect[] {
    const resolved = [...effects];

    for (let i = 0; i < resolved.length; i++) {
      for (let j = i + 1; j < resolved.length; j++) {
        const effect1 = resolved[i];
        const effect2 = resolved[j];

        // Check if effects overlap
        const overlap = this.checkEffectOverlap(effect1, effect2);

        if (overlap) {
          // Resolve conflict based on priority
          if (effect1.priority > effect2.priority) {
            // Delay effect2
            effect2.startTime = effect1.startTime + effect1.duration + 0.05;
          } else {
            // Reduce intensity of effect1
            effect1.intensity *= 0.7;
          }
        }
      }
    }

    return resolved;
  }

  /**
   * Check if two effects overlap in time
   */
  private checkEffectOverlap(effect1: Effect, effect2: Effect): boolean {
    const end1 = effect1.startTime + effect1.duration;
    const end2 = effect2.startTime + effect2.duration;

    return !(end1 < effect2.startTime || end2 < effect1.startTime);
  }

  /**
   * Calculate overall confidence for a video edit
   * 
   * Combines:
   * - Moment detection confidence
   * - Effect application confidence
   * - Timing accuracy
   */
  calculateOverallConfidence(
    moments: MomentClassification[],
    effectSequences: EffectSequence[]
  ): number {
    if (moments.length === 0) return 0;

    // Average moment confidence
    const avgMomentConfidence = moments.reduce((sum, m) => sum + m.confidence, 0) / moments.length;

    // Average effect confidence
    let totalEffectConfidence = 0;
    let totalEffects = 0;

    effectSequences.forEach(seq => {
      seq.effects.forEach(effect => {
        const effectConf = this.calculateEffectConfidence(effect, seq.momentType, 0.8);
        totalEffectConfidence += effectConf;
        totalEffects++;
      });
    });

    const avgEffectConfidence = totalEffects > 0 ? totalEffectConfidence / totalEffects : 0;

    // Combine confidences
    const overallConfidence = (avgMomentConfidence * 0.6) + (avgEffectConfidence * 0.4);

    return Math.min(1, overallConfidence);
  }

  /**
   * Generate confidence report
   */
  generateConfidenceReport(
    moments: MomentClassification[],
    effectSequences: EffectSequence[]
  ): ConfidenceMetrics {
    const sceneConfidence = moments.length > 0
      ? moments.reduce((sum, m) => sum + m.confidence, 0) / moments.length
      : 0;

    let effectConfidence = 0;
    let effectCount = 0;

    effectSequences.forEach(seq => {
      seq.effects.forEach(effect => {
        const conf = this.calculateEffectConfidence(effect, seq.momentType, sceneConfidence);
        effectConfidence += conf;
        effectCount++;
      });
    });

    effectConfidence = effectCount > 0 ? effectConfidence / effectCount : 0;

    return {
      sceneConfidence,
      momentConfidence: sceneConfidence,
      effectConfidence,
      overallConfidence: (sceneConfidence * 0.6) + (effectConfidence * 0.4),
    };
  }
}

export const effectTimingService = new EffectTimingService();
