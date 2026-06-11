/**
 * Moment Classifier
 * 
 * Classifies detected moments into specific categories:
 * - Funny Fall
 * - Reaction Moment
 * - Transition Opportunity
 * - Pet Moment
 * - Fail Moment
 * - Sync Moment
 * - Emotional Peak
 * 
 * This is where context-aware editing becomes intelligent - understanding
 * not just WHAT is happening, but WHAT TYPE of moment it is, so we can
 * apply the right editing patterns.
 */

import { SceneAnalysis, FrameAnalysis } from './sceneDetection';

export interface MomentClassification {
  type: 'funny_fall' | 'reaction' | 'transition' | 'pet' | 'fail' | 'sync' | 'emotional_peak' | 'unknown';
  confidence: number;
  startFrame: number;
  endFrame: number;
  startTime: number;
  endTime: number;
  description: string;
  suggestedEffects: string[];
}

/**
 * Moment Classifier Service
 * 
 * Analyzes scene data and classifies moments into actionable categories.
 */
export class MomentClassifierService {
  /**
   * Classify a funny fall moment
   * 
   * Indicators:
   * - Person detected
   * - High motion
   * - Surprised expression
   * - Body pose changes dramatically
   */
  private classifyFunnyFall(scenes: FrameAnalysis[], startIdx: number): MomentClassification | null {
    const scene = scenes[startIdx];
    
    if (!scene.people || scene.people === 0) return null;

    // Check for indicators
    const hasHighMotion = scene.motion > 50;
    const hasSurprised = scene.faceExpressions.surprised > 0.5;
    const hasPoseChange = this.detectPoseChange(scenes, startIdx);

    const confidence = (
      (hasHighMotion ? 0.4 : 0) +
      (hasSurprised ? 0.3 : 0) +
      (hasPoseChange ? 0.3 : 0)
    );

    if (confidence < 0.6) return null;

    return {
      type: 'funny_fall',
      confidence,
      startFrame: scene.frameNumber,
      endFrame: scenes[Math.min(startIdx + 3, scenes.length - 1)].frameNumber,
      startTime: scene.timestamp,
      endTime: scenes[Math.min(startIdx + 3, scenes.length - 1)].timestamp,
      description: 'Person falling or stumbling - comedic moment detected',
      suggestedEffects: ['freeze_frame', 'zoom_in', 'meme_sound', 'big_head_effect'],
    };
  }

  /**
   * Classify a reaction moment
   * 
   * Indicators:
   * - Person detected
   * - Strong facial expression (surprised, happy, sad)
   * - Relatively low motion (face-focused)
   */
  private classifyReaction(scenes: FrameAnalysis[], startIdx: number): MomentClassification | null {
    const scene = scenes[startIdx];

    if (!scene.people || scene.people === 0) return null;

    const expressions = scene.faceExpressions;
    const strongExpression = Math.max(
      expressions.surprised,
      expressions.happy,
      expressions.sad,
      expressions.angry
    );

    if (strongExpression < 0.6) return null;

    const expressionType = 
      expressions.surprised > 0.6 ? 'surprised' :
      expressions.happy > 0.6 ? 'happy' :
      expressions.sad > 0.6 ? 'sad' :
      'angry';

    return {
      type: 'reaction',
      confidence: strongExpression,
      startFrame: scene.frameNumber,
      endFrame: scenes[Math.min(startIdx + 2, scenes.length - 1)].frameNumber,
      startTime: scene.timestamp,
      endTime: scenes[Math.min(startIdx + 2, scenes.length - 1)].timestamp,
      description: `${expressionType} reaction moment detected`,
      suggestedEffects: ['zoom', 'sound_effect', 'slow_motion', 'eye_zoom'],
    };
  }

  /**
   * Classify a transition opportunity
   * 
   * Indicators:
   * - Scene cut (motion spike)
   * - Object movement across frame
   * - Natural pause point
   */
  private classifyTransition(scenes: FrameAnalysis[], startIdx: number): MomentClassification | null {
    const scene = scenes[startIdx];
    const nextScene = scenes[Math.min(startIdx + 1, scenes.length - 1)];

    // Check for motion spike (scene cut)
    const motionSpike = Math.abs(scene.motion - (nextScene?.motion || 0)) > 40;

    if (!motionSpike) return null;

    return {
      type: 'transition',
      confidence: 0.85,
      startFrame: scene.frameNumber,
      endFrame: nextScene.frameNumber,
      startTime: scene.timestamp,
      endTime: nextScene.timestamp,
      description: 'Natural transition point detected',
      suggestedEffects: ['smooth_morph', 'object_wipe', 'flash_transition', 'music_sync'],
    };
  }

  /**
   * Classify a pet moment
   * 
   * Indicators:
   * - Pet detected (dog, cat, etc.)
   * - Cute/funny expression or action
   * - High engagement potential
   */
  private classifyPetMoment(scenes: FrameAnalysis[], startIdx: number): MomentClassification | null {
    const scene = scenes[startIdx];

    const hasPet = scene.objects.some(obj => 
      ['dog', 'cat', 'rabbit', 'hamster', 'bird'].includes(obj.class)
    );

    if (!hasPet) return null;

    // Pet moments are inherently engaging
    const confidence = 0.9;

    return {
      type: 'pet',
      confidence,
      startFrame: scene.frameNumber,
      endFrame: scenes[Math.min(startIdx + 4, scenes.length - 1)].frameNumber,
      startTime: scene.timestamp,
      endTime: scenes[Math.min(startIdx + 4, scenes.length - 1)].timestamp,
      description: 'Cute pet moment detected - high engagement potential',
      suggestedEffects: ['cute_zoom', 'slow_motion', 'heart_particles', 'cute_sound'],
    };
  }

  /**
   * Classify a fail moment
   * 
   * Indicators:
   * - Person detected
   * - Unexpected action (based on pose)
   * - High motion followed by stillness
   */
  private classifyFailMoment(scenes: FrameAnalysis[], startIdx: number): MomentClassification | null {
    const scene = scenes[startIdx];
    const nextScene = scenes[Math.min(startIdx + 1, scenes.length - 1)];

    if (!scene.people || scene.people === 0) return null;

    // Fail moments: high motion followed by stillness
    const failPattern = scene.motion > 60 && (nextScene?.motion || 0) < 20;

    if (!failPattern) return null;

    return {
      type: 'fail',
      confidence: 0.8,
      startFrame: scene.frameNumber,
      endFrame: nextScene.frameNumber,
      startTime: scene.timestamp,
      endTime: nextScene.timestamp,
      description: 'Fail moment detected - person attempting something and failing',
      suggestedEffects: ['rewind', 'slow_motion', 'sad_trombone', 'replay'],
    };
  }

  /**
   * Classify an emotional peak
   * 
   * Indicators:
   * - Strong emotion (happy, sad, surprised)
   * - Often accompanied by high motion
   * - Peak engagement moment
   */
  private classifyEmotionalPeak(scenes: FrameAnalysis[], startIdx: number): MomentClassification | null {
    const scene = scenes[startIdx];

    const emotions = scene.faceExpressions;
    const strongEmotion = Math.max(
      emotions.happy,
      emotions.sad,
      emotions.surprised,
      emotions.angry
    );

    if (strongEmotion < 0.75) return null;

    const emotionType = 
      emotions.happy > 0.75 ? 'joy' :
      emotions.surprised > 0.75 ? 'shock' :
      emotions.sad > 0.75 ? 'sadness' :
      'anger';

    return {
      type: 'emotional_peak',
      confidence: strongEmotion,
      startFrame: scene.frameNumber,
      endFrame: scenes[Math.min(startIdx + 3, scenes.length - 1)].frameNumber,
      startTime: scene.timestamp,
      endTime: scenes[Math.min(startIdx + 3, scenes.length - 1)].timestamp,
      description: `Emotional peak: ${emotionType}`,
      suggestedEffects: ['slow_motion', 'music_swell', 'particle_effect', 'color_grade'],
    };
  }

  /**
   * Detect if pose changes significantly between frames
   */
  private detectPoseChange(scenes: FrameAnalysis[], frameIdx: number): boolean {
    const currentScene = scenes[frameIdx];
    const prevScene = frameIdx > 0 ? scenes[frameIdx - 1] : null;

    if (!prevScene || !currentScene.poses.length || !prevScene.poses.length) {
      return false;
    }

    const currentPose = currentScene.poses[0];
    const prevPose = prevScene.poses[0];

    // Calculate average distance between keypoints
    let totalDistance = 0;
    let count = 0;

    for (let i = 0; i < Math.min(currentPose.length, prevPose.length); i++) {
      const dx = currentPose[i].x - prevPose[i].x;
      const dy = currentPose[i].y - prevPose[i].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
      count++;
    }

    const avgDistance = totalDistance / count;
    return avgDistance > 50; // Threshold for significant pose change
  }

  /**
   * Classify all moments in a video
   */
  classifyMoments(analysis: SceneAnalysis): MomentClassification[] {
    const moments: MomentClassification[] = [];
    const scenes = analysis.scenes;

    // Iterate through scenes and classify moments
    for (let i = 0; i < scenes.length; i++) {
      // Try each classifier
      const classifiers = [
        () => this.classifyFunnyFall(scenes, i),
        () => this.classifyReaction(scenes, i),
        () => this.classifyTransition(scenes, i),
        () => this.classifyPetMoment(scenes, i),
        () => this.classifyFailMoment(scenes, i),
        () => this.classifyEmotionalPeak(scenes, i),
      ];

      let bestClassification: MomentClassification | null = null;
      let bestConfidence = 0;

      for (const classifier of classifiers) {
        const classification = classifier();
        if (classification && classification.confidence > bestConfidence) {
          bestClassification = classification;
          bestConfidence = classification.confidence;
        }
      }

      // Add if confidence is high enough and not duplicate
      if (bestClassification && bestConfidence > 0.6) {
        const isDuplicate = moments.some(m => 
          Math.abs(m.startFrame - bestClassification!.startFrame) < 5
        );

        if (!isDuplicate) {
          moments.push(bestClassification);
          // Skip ahead to avoid overlapping classifications
          i = bestClassification.endFrame;
        }
      }
    }

    return moments;
  }

  /**
   * Get suggested editing strategy for a moment
   */
  getSuggestedStrategy(moment: MomentClassification): {
    description: string;
    effects: string[];
    duration: number;
    timing: string;
  } {
    const duration = moment.endTime - moment.startTime;

    const strategies: Record<string, any> = {
      funny_fall: {
        description: 'Apply comedic effects to amplify the funny moment',
        effects: moment.suggestedEffects,
        duration,
        timing: 'Start at peak motion, hold for 0.5s',
      },
      reaction: {
        description: 'Amplify the emotional reaction with zoom and sound',
        effects: moment.suggestedEffects,
        duration,
        timing: 'Start at expression peak',
      },
      transition: {
        description: 'Create smooth transition between scenes',
        effects: moment.suggestedEffects,
        duration: 0.5,
        timing: 'Apply during scene cut',
      },
      pet: {
        description: 'Highlight the cute moment with engaging effects',
        effects: moment.suggestedEffects,
        duration,
        timing: 'Extend duration for maximum cuteness',
      },
      fail: {
        description: 'Emphasize the fail with comedic timing',
        effects: moment.suggestedEffects,
        duration,
        timing: 'Rewind before the fail, slow-mo during',
      },
      sync: {
        description: 'Sync visual effects with audio beats',
        effects: moment.suggestedEffects,
        duration,
        timing: 'Align with music beats',
      },
      emotional_peak: {
        description: 'Amplify emotional impact with cinematic effects',
        effects: moment.suggestedEffects,
        duration,
        timing: 'Slow motion at peak emotion',
      },
    };

    return strategies[moment.type] || {
      description: 'Apply standard editing effects',
      effects: [],
      duration,
      timing: 'Standard timing',
    };
  }
}

export const momentClassifierService = new MomentClassifierService();
