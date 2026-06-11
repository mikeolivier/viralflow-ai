/**
 * Intelligent Moment Classifier
 * 
 * Classifies moments not just by type, but by:
 * - What editing needs this moment has
 * - What effects would enhance it
 * - How confident we are
 * - Why we made this classification
 * 
 * This is where context becomes actionable editing decisions.
 * A talented editor doesn't just see "funny fall" - they see
 * "comedic moment that needs timing and exaggeration."
 */

import { DeepContext } from './deepContextAnalyzer';

export interface EditingNeed {
  type: 'timing' | 'emphasis' | 'emotion' | 'pacing' | 'focus' | 'transition' | 'energy' | 'clarity';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  reason: string;
}

export interface EffectRecommendation {
  name: string;
  type: 'visual' | 'audio' | 'transition' | 'filter' | 'composite';
  confidence: number; // 0-1
  priority: 'critical' | 'high' | 'medium' | 'low';
  timing: {
    startOffset: number; // seconds from moment start
    duration: number;
  };
  intensity: number; // 0-1
  reason: string;
  alternatives: string[]; // Other effects that could work
}

export interface MomentClassification {
  // Basic classification
  primaryType: string;
  secondaryTypes: string[];
  confidence: number;

  // Editing intelligence
  editingNeeds: EditingNeed[];
  recommendedEffects: EffectRecommendation[];

  // Context
  context: DeepContext;

  // Explanation
  reasoning: string;
  editingPhilosophy: string; // How should we edit this?

  // Constraints
  constraints: {
    maxEffects: number; // Don't over-edit
    maxDuration: number; // Don't drag it out
    stylePreference: 'subtle' | 'balanced' | 'bold';
    platformOptimization: string;
  };
}

/**
 * Intelligent Moment Classifier Service
 * 
 * Classifies moments with the wisdom of a talented editor.
 */
export class IntelligentMomentClassifierService {
  /**
   * Classify a moment with full intelligence
   */
  classifyMoment(
    context: DeepContext,
    sceneDescription: string
  ): MomentClassification {
    // Determine primary type based on context
    const primaryType = this.determinePrimaryType(context, sceneDescription);
    const secondaryTypes = this.determineSecondaryTypes(context, primaryType);

    // Calculate confidence
    const confidence = this.calculateConfidence(context, primaryType);

    // Determine editing needs
    const editingNeeds = this.determineEditingNeeds(context, primaryType);

    // Generate effect recommendations
    const recommendedEffects = this.generateEffectRecommendations(
      context,
      primaryType,
      editingNeeds
    );

    // Determine constraints
    const constraints = this.determineConstraints(context, primaryType);

    // Generate reasoning
    const reasoning = this.generateReasoning(context, primaryType, editingNeeds);
    const editingPhilosophy = this.generateEditingPhilosophy(
      context,
      primaryType,
      editingNeeds
    );

    return {
      primaryType,
      secondaryTypes,
      confidence,
      editingNeeds,
      recommendedEffects,
      context,
      reasoning,
      editingPhilosophy,
      constraints,
    };
  }

  /**
   * Determine primary moment type
   */
  private determinePrimaryType(context: DeepContext, description: string): string {
    const emotion = context.emotional.primaryEmotion;
    const intensity = context.emotional.emotionalIntensity;
    const narrative = context.narrative.narrativeFunction;

    // Emotion-based classification
    if (emotion === 'joy' && intensity > 0.7) {
      if (description.includes('fall') || description.includes('fail')) {
        return 'comedic_fail';
      }
      return 'comedic_moment';
    }

    if (emotion === 'surprise' && intensity > 0.7) {
      return 'reaction_moment';
    }

    if (emotion === 'fear' || emotion === 'anticipation') {
      return 'tension_moment';
    }

    if (emotion === 'sadness') {
      return 'emotional_moment';
    }

    // Narrative-based classification
    if (narrative === 'climax') {
      return 'climax_moment';
    }

    if (narrative === 'transition') {
      return 'transition_moment';
    }

    // Default
    return 'general_moment';
  }

  /**
   * Determine secondary moment types
   */
  private determineSecondaryTypes(context: DeepContext, primaryType: string): string[] {
    const secondary: string[] = [];

    // Add based on characteristics
    if (context.temporal.isMomentPeak) {
      secondary.push('peak_moment');
    }

    if (context.visual.movement === 'fast' || context.visual.movement === 'chaotic') {
      secondary.push('high_energy');
    }

    if (context.audience.viewerRetention > 0.8) {
      secondary.push('high_engagement');
    }

    if (context.visual.depth === 'shallow') {
      secondary.push('focused_subject');
    }

    return secondary;
  }

  /**
   * Calculate classification confidence
   */
  private calculateConfidence(context: DeepContext, primaryType: string): number {
    // Confidence based on how clear the moment is
    let confidence = 0.5;

    // Increase confidence if emotional intensity is clear
    confidence += context.emotional.emotionalIntensity * 0.3;

    // Increase confidence if narrative function is clear
    confidence += context.narrative.storyImportance * 0.2;

    return Math.min(confidence, 1.0);
  }

  /**
   * Determine what editing needs this moment has
   */
  private determineEditingNeeds(
    context: DeepContext,
    primaryType: string
  ): EditingNeed[] {
    const needs: EditingNeed[] = [];

    // Comedic moments need timing
    if (primaryType.includes('comedic')) {
      needs.push({
        type: 'timing',
        priority: 'critical',
        description: 'Perfect timing is essential for comedy',
        reason: 'Comedy relies on precise timing for maximum impact',
      });

      needs.push({
        type: 'emphasis',
        priority: 'high',
        description: 'Emphasize the punchline',
        reason: 'Viewers need to clearly see what makes it funny',
      });
    }

    // Reaction moments need focus
    if (primaryType.includes('reaction')) {
      needs.push({
        type: 'focus',
        priority: 'critical',
        description: 'Focus on the face/reaction',
        reason: 'The reaction is the entire point of this moment',
      });

      needs.push({
        type: 'emotion',
        priority: 'high',
        description: 'Amplify the emotional response',
        reason: 'Viewers want to feel what the person feels',
      });
    }

    // Emotional moments need pacing
    if (primaryType.includes('emotional')) {
      needs.push({
        type: 'pacing',
        priority: 'critical',
        description: 'Slow down to let emotion breathe',
        reason: 'Emotional moments need space to land',
      });

      needs.push({
        type: 'emotion',
        priority: 'high',
        description: 'Enhance emotional impact',
        reason: 'Viewers want to connect emotionally',
      });
    }

    // Climax moments need energy
    if (primaryType.includes('climax')) {
      needs.push({
        type: 'energy',
        priority: 'critical',
        description: 'Build energy and intensity',
        reason: 'Climax moments need maximum impact',
      });

      needs.push({
        type: 'emphasis',
        priority: 'high',
        description: 'Make it unmissable',
        reason: 'This is the payoff moment',
      });
    }

    // Transition moments need clarity
    if (primaryType.includes('transition')) {
      needs.push({
        type: 'transition',
        priority: 'critical',
        description: 'Create smooth flow between scenes',
        reason: 'Transitions should feel natural and intentional',
      });

      needs.push({
        type: 'clarity',
        priority: 'high',
        description: 'Make the transition clear',
        reason: 'Viewers should understand the connection',
      });
    }

    // High-energy moments need pacing
    if (context.visual.movement === 'fast' || context.visual.movement === 'chaotic') {
      needs.push({
        type: 'pacing',
        priority: 'high',
        description: 'Match the energy with editing pace',
        reason: 'Editing should reflect the content energy',
      });
    }

    return needs;
  }

  /**
   * Generate effect recommendations based on editing needs
   */
  private generateEffectRecommendations(
    context: DeepContext,
    primaryType: string,
    editingNeeds: EditingNeed[]
  ): EffectRecommendation[] {
    const recommendations: EffectRecommendation[] = [];

    // Comedic moments
    if (primaryType.includes('comedic')) {
      if (context.emotional.emotionalIntensity > 0.7) {
        // Strong comedy - use levitation or exaggeration
        recommendations.push({
          name: 'levitation',
          type: 'visual',
          confidence: 0.85,
          priority: 'high',
          timing: { startOffset: 0.1, duration: 1.5 },
          intensity: 0.8,
          reason: 'Levitation adds impossible physics humor',
          alternatives: ['reverse_gravity', 'zoom_exaggerate'],
        });
      }

      // Add comedic sound
      recommendations.push({
        name: 'comedic_sound_effect',
        type: 'audio',
        confidence: 0.9,
        priority: 'critical',
        timing: { startOffset: 0.2, duration: 0.5 },
        intensity: 0.7,
        reason: 'Sound effect timing is crucial for comedy',
        alternatives: ['meme_sound', 'impact_sound'],
      });

      // Add zoom for emphasis
      recommendations.push({
        name: 'emphasis_zoom',
        type: 'visual',
        confidence: 0.8,
        priority: 'high',
        timing: { startOffset: 0.15, duration: 0.8 },
        intensity: 0.6,
        reason: 'Zoom emphasizes the comedic moment',
        alternatives: ['slow_zoom', 'quick_zoom'],
      });
    }

    // Reaction moments
    if (primaryType.includes('reaction')) {
      // Focus on face with zoom
      recommendations.push({
        name: 'face_zoom',
        type: 'visual',
        confidence: 0.95,
        priority: 'critical',
        timing: { startOffset: 0.05, duration: 1.0 },
        intensity: 0.7,
        reason: 'Zoom on face to show reaction clearly',
        alternatives: ['slow_zoom', 'dramatic_zoom'],
      });

      // Add slow motion for impact
      recommendations.push({
        name: 'slow_motion',
        type: 'visual',
        confidence: 0.85,
        priority: 'high',
        timing: { startOffset: 0.1, duration: 1.5 },
        intensity: 0.5,
        reason: 'Slow motion lets reaction sink in',
        alternatives: ['variable_slow_motion'],
      });

      // Add reaction sound
      recommendations.push({
        name: 'reaction_sound',
        type: 'audio',
        confidence: 0.8,
        priority: 'medium',
        timing: { startOffset: 0.3, duration: 0.8 },
        intensity: 0.6,
        reason: 'Sound effect amplifies reaction',
        alternatives: ['gasp_sound', 'wow_sound'],
      });
    }

    // Emotional moments
    if (primaryType.includes('emotional')) {
      // Slow down
      recommendations.push({
        name: 'slow_motion',
        type: 'visual',
        confidence: 0.9,
        priority: 'critical',
        timing: { startOffset: 0, duration: context.temporal.duration },
        intensity: 0.6,
        reason: 'Slow motion gives emotional moments space',
        alternatives: ['variable_slow_motion'],
      });

      // Warm color grade
      recommendations.push({
        name: 'warm_color_grade',
        type: 'filter',
        confidence: 0.8,
        priority: 'high',
        timing: { startOffset: 0, duration: context.temporal.duration },
        intensity: 0.5,
        reason: 'Warm colors enhance emotional connection',
        alternatives: ['cinematic_grade', 'nostalgic_grade'],
      });

      // Music swell
      recommendations.push({
        name: 'music_swell',
        type: 'audio',
        confidence: 0.85,
        priority: 'high',
        timing: { startOffset: 0.2, duration: context.temporal.duration - 0.2 },
        intensity: 0.7,
        reason: 'Music amplifies emotional impact',
        alternatives: ['orchestral_swell', 'ambient_music'],
      });
    }

    // Climax moments
    if (primaryType.includes('climax')) {
      // Build energy
      recommendations.push({
        name: 'quick_cuts',
        type: 'transition',
        confidence: 0.8,
        priority: 'high',
        timing: { startOffset: 0, duration: context.temporal.duration },
        intensity: 0.8,
        reason: 'Quick cuts build climactic energy',
        alternatives: ['jump_cuts', 'rapid_transitions'],
      });

      // Add impact sound
      recommendations.push({
        name: 'impact_sound',
        type: 'audio',
        confidence: 0.9,
        priority: 'critical',
        timing: { startOffset: 0.3, duration: 0.5 },
        intensity: 0.9,
        reason: 'Impact sound punctuates the climax',
        alternatives: ['explosion_sound', 'hit_sound'],
      });
    }

    return recommendations;
  }

  /**
   * Determine editing constraints
   */
  private determineConstraints(
    context: DeepContext,
    primaryType: string
  ): MomentClassification['constraints'] {
    let maxEffects = 3; // Default: don't over-edit
    let maxDuration = context.temporal.duration + 1; // Don't drag it out
    let stylePreference: 'subtle' | 'balanced' | 'bold' = 'balanced';

    // Comedic moments can be bolder
    if (primaryType.includes('comedic')) {
      maxEffects = 4;
      stylePreference = 'bold';
    }

    // Emotional moments should be subtle
    if (primaryType.includes('emotional')) {
      maxEffects = 2;
      stylePreference = 'subtle';
    }

    // High-intensity moments can have more effects
    if (context.emotional.emotionalIntensity > 0.8) {
      maxEffects = Math.min(maxEffects + 1, 5);
    }

    // Short moments shouldn't have many effects
    if (context.temporal.duration < 0.5) {
      maxEffects = 1;
    }

    return {
      maxEffects,
      maxDuration,
      stylePreference,
      platformOptimization: context.audience.platform,
    };
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(
    context: DeepContext,
    primaryType: string,
    editingNeeds: EditingNeed[]
  ): string {
    let reasoning = `This is a ${primaryType} moment. `;

    reasoning += `Emotionally, it's ${context.emotional.primaryEmotion} with ${(context.emotional.emotionalIntensity * 100).toFixed(0)}% intensity. `;

    reasoning += `Narratively, it serves as a ${context.narrative.narrativeFunction} moment. `;

    reasoning += `The key editing needs are: ${editingNeeds.map(n => n.type).join(', ')}. `;

    reasoning += `This moment is ${context.narrative.payoffPotential > 0.7 ? 'highly' : 'moderately'} important to the overall video.`;

    return reasoning;
  }

  /**
   * Generate editing philosophy
   */
  private generateEditingPhilosophy(
    context: DeepContext,
    primaryType: string,
    editingNeeds: EditingNeed[]
  ): string {
    let philosophy = '';

    if (primaryType.includes('comedic')) {
      philosophy = 'Timing is everything. Let the comedy breathe, but emphasize the punchline. Use exaggeration, not subtlety.';
    } else if (primaryType.includes('reaction')) {
      philosophy = 'Focus on the face. Let viewers see the emotion clearly. Use zoom and slow-motion to amplify the reaction.';
    } else if (primaryType.includes('emotional')) {
      philosophy = 'Less is more. Give the moment space. Use subtle color grading and music to enhance, not overpower.';
    } else if (primaryType.includes('climax')) {
      philosophy = 'Build energy. Use quick cuts, sound effects, and intensity to create maximum impact. This is the payoff.';
    } else if (primaryType.includes('transition')) {
      philosophy = 'Create flow. Transitions should feel natural and intentional. Guide the viewer smoothly between scenes.';
    } else {
      philosophy = 'Balance is key. Use editing to enhance the moment without overwhelming it. Let the content speak.';
    }

    return philosophy;
  }

  /**
   * Compare two classifications to understand progression
   */
  compareClassifications(
    classification1: MomentClassification,
    classification2: MomentClassification
  ): {
    typeShift: boolean;
    intensityChange: number;
    editingNeedsChange: string[];
  } {
    const typeShift = classification1.primaryType !== classification2.primaryType;
    const intensityChange =
      classification2.context.emotional.emotionalIntensity -
      classification1.context.emotional.emotionalIntensity;

    const needs1 = new Set(classification1.editingNeeds.map(n => n.type));
    const needs2 = new Set(classification2.editingNeeds.map(n => n.type));

    const editingNeedsChange = Array.from(
      new Set([...needs1, ...needs2]).values()
    ).filter(need => needs1.has(need) !== needs2.has(need));

    return {
      typeShift,
      intensityChange,
      editingNeedsChange,
    };
  }
}

export const intelligentMomentClassifierService = new IntelligentMomentClassifierService();
