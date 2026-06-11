/**
 * Effect Sequencer
 * 
 * Maps detected moments to specific editing effects and sequences them
 * in the right order with proper timing and intensity.
 * 
 * This is where the magic happens - taking a detected moment and applying
 * a sophisticated sequence of effects that feel natural and engaging.
 */

import { MomentClassification } from './momentClassifier';

export interface Effect {
  name: string;
  type: 'visual' | 'audio' | 'transition' | 'filter';
  startTime: number;
  duration: number;
  intensity: number; // 0-1
  parameters: Record<string, any>;
}

export interface EffectSequence {
  momentType: string;
  momentTime: number;
  effects: Effect[];
  totalDuration: number;
  description: string;
}

/**
 * Effect Sequencer Service
 * 
 * Converts moment classifications into specific effect sequences.
 */
export class EffectSequencerService {
  /**
   * Create effect sequence for a funny fall moment
   */
  private sequenceFunnyFall(moment: MomentClassification): Effect[] {
    const effects: Effect[] = [];
    const startTime = moment.startTime;

    // 1. Freeze frame at peak moment
    effects.push({
      name: 'freeze_frame',
      type: 'visual',
      startTime: startTime + 0.1,
      duration: 0.3,
      intensity: 1,
      parameters: {
        frame: 'peak_motion',
      },
    });

    // 2. Zoom in on person
    effects.push({
      name: 'zoom_in',
      type: 'visual',
      startTime: startTime + 0.15,
      duration: 0.4,
      intensity: 0.8,
      parameters: {
        zoomLevel: 1.5,
        easing: 'ease_out',
      },
    });

    // 3. Meme sound effect
    effects.push({
      name: 'meme_sound',
      type: 'audio',
      startTime: startTime + 0.2,
      duration: 0.5,
      intensity: 0.9,
      parameters: {
        sound: 'vine_boom',
        volume: 0.8,
      },
    });

    // 4. Big head effect (optional, for comedy)
    effects.push({
      name: 'big_head_effect',
      type: 'visual',
      startTime: startTime + 0.25,
      duration: 0.6,
      intensity: 0.6,
      parameters: {
        scale: 1.8,
        target: 'head',
      },
    });

    // 5. Rewind effect
    effects.push({
      name: 'rewind',
      type: 'visual',
      startTime: startTime + 0.9,
      duration: 0.4,
      intensity: 0.7,
      parameters: {
        speed: 2,
      },
    });

    return effects;
  }

  /**
   * Create effect sequence for a reaction moment
   */
  private sequenceReaction(moment: MomentClassification): Effect[] {
    const effects: Effect[] = [];
    const startTime = moment.startTime;

    // 1. Zoom in on face
    effects.push({
      name: 'zoom_in',
      type: 'visual',
      startTime: startTime,
      duration: 0.5,
      intensity: 0.9,
      parameters: {
        zoomLevel: 1.3,
        target: 'face',
        easing: 'ease_out',
      },
    });

    // 2. Slow motion
    effects.push({
      name: 'slow_motion',
      type: 'visual',
      startTime: startTime + 0.1,
      duration: moment.endTime - moment.startTime - 0.1,
      intensity: 0.8,
      parameters: {
        speed: 0.5,
      },
    });

    // 3. Sound effect (reaction-appropriate)
    effects.push({
      name: 'reaction_sound',
      type: 'audio',
      startTime: startTime + 0.2,
      duration: 0.6,
      intensity: 0.7,
      parameters: {
        sound: 'wow_sound',
        volume: 0.6,
      },
    });

    // 4. Eye zoom (focus on eyes)
    effects.push({
      name: 'eye_zoom',
      type: 'visual',
      startTime: startTime + 0.3,
      duration: 0.4,
      intensity: 0.5,
      parameters: {
        zoomLevel: 1.2,
        target: 'eyes',
      },
    });

    // 5. Color grade (enhance emotion)
    effects.push({
      name: 'color_grade',
      type: 'filter',
      startTime: startTime,
      duration: moment.endTime - moment.startTime,
      intensity: 0.4,
      parameters: {
        saturation: 1.2,
        contrast: 1.1,
      },
    });

    return effects;
  }

  /**
   * Create effect sequence for a transition moment
   */
  private sequenceTransition(moment: MomentClassification): Effect[] {
    const effects: Effect[] = [];
    const startTime = moment.startTime;

    // 1. Smooth morph transition
    effects.push({
      name: 'smooth_morph',
      type: 'transition',
      startTime: startTime,
      duration: 0.6,
      intensity: 1,
      parameters: {
        easing: 'ease_in_out',
      },
    });

    // 2. Music sync (if audio available)
    effects.push({
      name: 'music_sync',
      type: 'audio',
      startTime: startTime,
      duration: 0.6,
      intensity: 0.8,
      parameters: {
        alignToBeat: true,
      },
    });

    // 3. Flash effect (optional)
    effects.push({
      name: 'flash_transition',
      type: 'visual',
      startTime: startTime + 0.3,
      duration: 0.2,
      intensity: 0.5,
      parameters: {
        color: '#FFFFFF',
        opacity: 0.3,
      },
    });

    return effects;
  }

  /**
   * Create effect sequence for a pet moment
   */
  private sequencePetMoment(moment: MomentClassification): Effect[] {
    const effects: Effect[] = [];
    const startTime = moment.startTime;

    // 1. Cute zoom
    effects.push({
      name: 'cute_zoom',
      type: 'visual',
      startTime: startTime,
      duration: 0.5,
      intensity: 0.8,
      parameters: {
        zoomLevel: 1.2,
        easing: 'ease_out',
      },
    });

    // 2. Slow motion (to emphasize cuteness)
    effects.push({
      name: 'slow_motion',
      type: 'visual',
      startTime: startTime + 0.2,
      duration: moment.endTime - moment.startTime - 0.2,
      intensity: 0.6,
      parameters: {
        speed: 0.7,
      },
    });

    // 3. Heart particles
    effects.push({
      name: 'heart_particles',
      type: 'visual',
      startTime: startTime + 0.3,
      duration: 1,
      intensity: 0.7,
      parameters: {
        count: 15,
        color: '#FF69B4',
      },
    });

    // 4. Cute sound effect
    effects.push({
      name: 'cute_sound',
      type: 'audio',
      startTime: startTime + 0.5,
      duration: 0.8,
      intensity: 0.6,
      parameters: {
        sound: 'aww_sound',
        volume: 0.5,
      },
    });

    // 5. Warm color grade
    effects.push({
      name: 'warm_color_grade',
      type: 'filter',
      startTime: startTime,
      duration: moment.endTime - moment.startTime,
      intensity: 0.3,
      parameters: {
        warmth: 1.2,
        saturation: 1.1,
      },
    });

    return effects;
  }

  /**
   * Create effect sequence for a fail moment
   */
  private sequenceFailMoment(moment: MomentClassification): Effect[] {
    const effects: Effect[] = [];
    const startTime = moment.startTime;

    // 1. Rewind before the fail
    effects.push({
      name: 'rewind',
      type: 'visual',
      startTime: startTime - 0.5,
      duration: 0.5,
      intensity: 0.8,
      parameters: {
        speed: 2,
      },
    });

    // 2. Slow motion during fail
    effects.push({
      name: 'slow_motion',
      type: 'visual',
      startTime: startTime,
      duration: moment.endTime - moment.startTime,
      intensity: 0.9,
      parameters: {
        speed: 0.4,
      },
    });

    // 3. Sad trombone sound
    effects.push({
      name: 'sad_trombone',
      type: 'audio',
      startTime: startTime + 0.2,
      duration: 0.8,
      intensity: 0.8,
      parameters: {
        sound: 'sad_trombone',
        volume: 0.7,
      },
    });

    // 4. Zoom in on person during fail
    effects.push({
      name: 'zoom_in',
      type: 'visual',
      startTime: startTime + 0.1,
      duration: 0.6,
      intensity: 0.7,
      parameters: {
        zoomLevel: 1.3,
      },
    });

    // 5. Desaturate color (sad mood)
    effects.push({
      name: 'desaturate',
      type: 'filter',
      startTime: startTime,
      duration: moment.endTime - moment.startTime,
      intensity: 0.4,
      parameters: {
        saturation: 0.7,
      },
    });

    return effects;
  }

  /**
   * Create effect sequence for an emotional peak
   */
  private sequenceEmotionalPeak(moment: MomentClassification): Effect[] {
    const effects: Effect[] = [];
    const startTime = moment.startTime;

    // 1. Slow motion (cinematic)
    effects.push({
      name: 'slow_motion',
      type: 'visual',
      startTime: startTime,
      duration: moment.endTime - moment.startTime,
      intensity: 0.8,
      parameters: {
        speed: 0.6,
      },
    });

    // 2. Music swell
    effects.push({
      name: 'music_swell',
      type: 'audio',
      startTime: startTime + 0.2,
      duration: 1,
      intensity: 0.9,
      parameters: {
        volumeIncrease: 1.3,
      },
    });

    // 3. Particle effect
    effects.push({
      name: 'particle_effect',
      type: 'visual',
      startTime: startTime + 0.3,
      duration: 1.2,
      intensity: 0.6,
      parameters: {
        type: 'sparkles',
        count: 20,
      },
    });

    // 4. Cinematic color grade
    effects.push({
      name: 'cinematic_color_grade',
      type: 'filter',
      startTime: startTime,
      duration: moment.endTime - moment.startTime,
      intensity: 0.5,
      parameters: {
        contrast: 1.2,
        saturation: 1.1,
        warmth: 1.1,
      },
    });

    return effects;
  }

  /**
   * Generate effect sequence for a moment
   */
  generateEffectSequence(moment: MomentClassification): EffectSequence {
    let effects: Effect[] = [];

    switch (moment.type) {
      case 'funny_fall':
        effects = this.sequenceFunnyFall(moment);
        break;
      case 'reaction':
        effects = this.sequenceReaction(moment);
        break;
      case 'transition':
        effects = this.sequenceTransition(moment);
        break;
      case 'pet':
        effects = this.sequencePetMoment(moment);
        break;
      case 'fail':
        effects = this.sequenceFailMoment(moment);
        break;
      case 'emotional_peak':
        effects = this.sequenceEmotionalPeak(moment);
        break;
      default:
        effects = [];
    }

    // Calculate total duration
    const totalDuration = effects.length > 0
      ? Math.max(...effects.map(e => e.startTime + e.duration))
      : 0;

    return {
      momentType: moment.type,
      momentTime: moment.startTime,
      effects,
      totalDuration,
      description: `Applied ${effects.length} effects for ${moment.type} moment`,
    };
  }

  /**
   * Generate effect sequences for all moments in a video
   */
  generateAllEffectSequences(moments: MomentClassification[]): EffectSequence[] {
    return moments.map(moment => this.generateEffectSequence(moment));
  }

  /**
   * Optimize effect sequences to avoid conflicts
   */
  optimizeSequences(sequences: EffectSequence[]): EffectSequence[] {
    // Sort by moment time
    const sorted = [...sequences].sort((a, b) => a.momentTime - b.momentTime);

    // Check for overlapping effects and adjust timing
    const optimized: EffectSequence[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const sequence = sorted[i];
      const nextSequence = sorted[i + 1];

      if (nextSequence) {
        const currentEnd = sequence.momentTime + sequence.totalDuration;
        const nextStart = nextSequence.momentTime;

        // If sequences overlap, reduce duration of current sequence
        if (currentEnd > nextStart) {
          const overlapAmount = currentEnd - nextStart;
          sequence.effects.forEach(effect => {
            if (effect.startTime + effect.duration > nextStart - sequence.momentTime) {
              effect.duration = Math.max(0.1, effect.duration - overlapAmount);
            }
          });
        }
      }

      optimized.push(sequence);
    }

    return optimized;
  }

  /**
   * Export effect sequences to FFmpeg filter graph
   */
  exportToFFmpegFilterGraph(sequences: EffectSequence[]): string {
    const filters: string[] = [];

    sequences.forEach(sequence => {
      sequence.effects.forEach(effect => {
        switch (effect.name) {
          case 'zoom_in':
            filters.push(
              `scale=iw*${effect.parameters.zoomLevel}:ih*${effect.parameters.zoomLevel}`
            );
            break;
          case 'slow_motion':
            filters.push(`setpts=${1 / effect.parameters.speed}*PTS`);
            break;
          case 'freeze_frame':
            filters.push(`fps=fps=1`);
            break;
          case 'color_grade':
            filters.push(
              `eq=saturation=${effect.parameters.saturation}:contrast=${effect.parameters.contrast}`
            );
            break;
        }
      });
    });

    return filters.join(',');
  }
}

export const effectSequencerService = new EffectSequencerService();
