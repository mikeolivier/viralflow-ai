/**
 * Editing Decision Engine
 * 
 * Makes intelligent editing decisions like a talented video editor:
 * - Decides which effects to apply and which to skip
 * - Balances pacing vs. impact
 * - Respects constraints (don't over-edit)
 * - Makes trade-offs (bold vs. subtle)
 * - Learns from feedback
 * 
 * This is where the AI becomes a true collaborator,
 * not just a tool that applies effects mechanically.
 */

import { MomentClassification, EffectRecommendation } from './intelligentMomentClassifier';
import { DeepContext } from './deepContextAnalyzer';

export interface EditingDecision {
  // What effects to apply
  effectsToApply: EffectRecommendation[];
  effectsToSkip: EffectRecommendation[];

  // Why we made these decisions
  reasoning: string;
  tradeOffsConsidered: string[];

  // Constraints respected
  constraintsRespected: {
    maxEffectsRespected: boolean;
    pacingRespected: boolean;
    styleRespected: boolean;
    platformOptimized: boolean;
  };

  // Confidence in decision
  confidence: number;

  // Estimated impact
  estimatedImpact: {
    engagement: number; // 0-1
    shareability: number; // 0-1
    viewerRetention: number; // 0-1
  };

  // Feedback loop
  feedbackHooks: {
    whatWorked: string[];
    whatToImprove: string[];
  };
}

/**
 * Editing Decision Engine Service
 * 
 * Makes intelligent decisions about which effects to apply.
 */
export class EditingDecisionEngineService {
  /**
   * Make editing decisions for a moment
   */
  makeEditingDecisions(
    classification: MomentClassification,
    videoMetadata: {
      totalDuration: number;
      currentPosition: number;
      previousMoments: MomentClassification[];
      nextMoments: MomentClassification[];
      userPreferences?: {
        boldness: number; // 0-1, how bold should editing be?
        pacing: number; // 0-1, how fast should it be?
        effectDensity: number; // 0-1, how many effects?
      };
    }
  ): EditingDecision {
    // Get recommended effects
    const allRecommendations = classification.recommendedEffects;

    // Rank effects by priority and confidence
    const rankedEffects = this.rankEffects(allRecommendations, classification);

    // Select effects respecting constraints
    const { effectsToApply, effectsToSkip } = this.selectEffects(
      rankedEffects,
      classification,
      videoMetadata
    );

    // Validate pacing
    const pacingValid = this.validatePacing(effectsToApply, classification, videoMetadata);

    // Generate reasoning
    const reasoning = this.generateDecisionReasoning(
      classification,
      effectsToApply,
      effectsToSkip
    );

    // Document trade-offs
    const tradeOffsConsidered = this.documentTradeOffs(
      allRecommendations,
      effectsToApply,
      classification
    );

    // Check constraints
    const constraintsRespected = {
      maxEffectsRespected:
        effectsToApply.length <= classification.constraints.maxEffects,
      pacingRespected: pacingValid,
      styleRespected: this.validateStyle(
        effectsToApply,
        classification.constraints.stylePreference
      ),
      platformOptimized: this.validatePlatformOptimization(
        effectsToApply,
        classification.constraints.platformOptimization
      ),
    };

    // Calculate confidence
    const confidence = this.calculateDecisionConfidence(
      effectsToApply,
      constraintsRespected,
      classification
    );

    // Estimate impact
    const estimatedImpact = this.estimateImpact(
      effectsToApply,
      classification,
      videoMetadata
    );

    // Generate feedback hooks
    const feedbackHooks = this.generateFeedbackHooks(
      effectsToApply,
      classification
    );

    return {
      effectsToApply,
      effectsToSkip,
      reasoning,
      tradeOffsConsidered,
      constraintsRespected,
      confidence,
      estimatedImpact,
      feedbackHooks,
    };
  }

  /**
   * Rank effects by importance
   */
  private rankEffects(
    recommendations: EffectRecommendation[],
    classification: MomentClassification
  ): EffectRecommendation[] {
    return recommendations.sort((a, b) => {
      // Priority weight
      const priorityWeight = {
        critical: 3,
        high: 2,
        medium: 1,
        low: 0,
      };

      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Confidence weight
      return b.confidence - a.confidence;
    });
  }

  /**
   * Select which effects to apply
   */
  private selectEffects(
    rankedEffects: EffectRecommendation[],
    classification: MomentClassification,
    videoMetadata: any
  ): {
    effectsToApply: EffectRecommendation[];
    effectsToSkip: EffectRecommendation[];
  } {
    const effectsToApply: EffectRecommendation[] = [];
    const effectsToSkip: EffectRecommendation[] = [];

    let effectCount = 0;
    let totalDuration = 0;

    for (const effect of rankedEffects) {
      // Check if we've hit the max effects limit
      if (effectCount >= classification.constraints.maxEffects) {
        effectsToSkip.push(effect);
        continue;
      }

      // Check if adding this effect would exceed max duration
      const newTotalDuration = totalDuration + effect.timing.duration;
      if (newTotalDuration > classification.constraints.maxDuration) {
        effectsToSkip.push(effect);
        continue;
      }

      // Check if this is a critical effect (must apply)
      if (effect.priority === 'critical') {
        effectsToApply.push(effect);
        effectCount++;
        totalDuration += effect.timing.duration;
        continue;
      }

      // Check if this is a high-priority effect and we have room
      if (effect.priority === 'high' && effectCount < classification.constraints.maxEffects - 1) {
        effectsToApply.push(effect);
        effectCount++;
        totalDuration += effect.timing.duration;
        continue;
      }

      // For medium/low priority, only add if confidence is high and we have room
      if (
        effect.confidence > 0.75 &&
        effectCount < classification.constraints.maxEffects
      ) {
        effectsToApply.push(effect);
        effectCount++;
        totalDuration += effect.timing.duration;
      } else {
        effectsToSkip.push(effect);
      }
    }

    return { effectsToApply, effectsToSkip };
  }

  /**
   * Validate pacing
   */
  private validatePacing(
    effectsToApply: EffectRecommendation[],
    classification: MomentClassification,
    videoMetadata: any
  ): boolean {
    // Calculate total effect duration
    const totalEffectDuration = effectsToApply.reduce(
      (sum, effect) => sum + effect.timing.duration,
      0
    );

    // Pacing rule: effects shouldn't exceed 1.5x the original moment duration
    const maxAllowedDuration = classification.temporal.duration * 1.5;

    return totalEffectDuration <= maxAllowedDuration;
  }

  /**
   * Validate style consistency
   */
  private validateStyle(
    effectsToApply: EffectRecommendation[],
    stylePreference: 'subtle' | 'balanced' | 'bold'
  ): boolean {
    // Count effect intensity
    const averageIntensity =
      effectsToApply.reduce((sum, effect) => sum + effect.intensity, 0) /
      (effectsToApply.length || 1);

    switch (stylePreference) {
      case 'subtle':
        return averageIntensity <= 0.5;
      case 'balanced':
        return averageIntensity <= 0.7;
      case 'bold':
        return true; // Bold style accepts any intensity
      default:
        return true;
    }
  }

  /**
   * Validate platform optimization
   */
  private validatePlatformOptimization(
    effectsToApply: EffectRecommendation[],
    platform: string
  ): boolean {
    // TikTok and Instagram Reels prefer bold, fast effects
    if (platform === 'tiktok' || platform === 'instagram_reels') {
      const hasQuickEffects = effectsToApply.some(e => e.timing.duration < 1);
      return hasQuickEffects || effectsToApply.length > 0;
    }

    // YouTube prefers balanced effects
    if (platform === 'youtube') {
      return effectsToApply.length > 0;
    }

    return true;
  }

  /**
   * Calculate decision confidence
   */
  private calculateDecisionConfidence(
    effectsToApply: EffectRecommendation[],
    constraintsRespected: any,
    classification: MomentClassification
  ): number {
    let confidence = classification.confidence; // Start with classification confidence

    // Increase confidence if all constraints are respected
    const constraintsCount = Object.values(constraintsRespected).filter(
      v => v === true
    ).length;
    confidence += (constraintsCount / 4) * 0.2; // Up to +0.2

    // Increase confidence if we have high-confidence effects
    const avgEffectConfidence =
      effectsToApply.reduce((sum, e) => sum + e.confidence, 0) /
      (effectsToApply.length || 1);
    confidence += avgEffectConfidence * 0.1; // Up to +0.1

    return Math.min(confidence, 1.0);
  }

  /**
   * Estimate impact of editing decisions
   */
  private estimateImpact(
    effectsToApply: EffectRecommendation[],
    classification: MomentClassification,
    videoMetadata: any
  ): EditingDecision['estimatedImpact'] {
    // Base impact from moment importance
    let engagement = classification.context.emotional.emotionalIntensity;
    let shareability = classification.context.audience.viewerRetention;
    let viewerRetention = classification.context.audience.viewerRetention;

    // Boost impact from effects
    effectsToApply.forEach(effect => {
      const effectBoost = effect.confidence * effect.intensity * 0.15; // Up to +0.15 per effect

      if (effect.type === 'visual') {
        engagement += effectBoost;
        shareability += effectBoost * 0.8;
      } else if (effect.type === 'audio') {
        engagement += effectBoost * 0.9;
      } else if (effect.type === 'transition') {
        viewerRetention += effectBoost;
      }
    });

    // Cap at 1.0
    engagement = Math.min(engagement, 1.0);
    shareability = Math.min(shareability, 1.0);
    viewerRetention = Math.min(viewerRetention, 1.0);

    return {
      engagement,
      shareability,
      viewerRetention,
    };
  }

  /**
   * Generate decision reasoning
   */
  private generateDecisionReasoning(
    classification: MomentClassification,
    effectsToApply: EffectRecommendation[],
    effectsToSkip: EffectRecommendation[]
  ): string {
    let reasoning = `For this ${classification.primaryType} moment, `;

    reasoning += `I'm applying ${effectsToApply.length} effects: ${effectsToApply.map(e => e.name).join(', ')}. `;

    if (effectsToSkip.length > 0) {
      reasoning += `I'm skipping ${effectsToSkip.length} effects (${effectsToSkip.map(e => e.name).join(', ')}) `;
      reasoning += `because ${this.getSkipReason(effectsToSkip[0], classification)}. `;
    }

    reasoning += `This respects the "${classification.constraints.stylePreference}" style preference `;
    reasoning += `and keeps the moment focused on ${classification.editingNeeds[0]?.type || 'impact'}.`;

    return reasoning;
  }

  /**
   * Get reason why an effect was skipped
   */
  private getSkipReason(effect: EffectRecommendation, classification: MomentClassification): string {
    if (effect.priority === 'low') {
      return 'they have low priority';
    }
    if (effect.timing.duration > classification.constraints.maxDuration) {
      return 'they would make the moment drag';
    }
    return 'they would over-edit the moment';
  }

  /**
   * Document trade-offs considered
   */
  private documentTradeOffs(
    allRecommendations: EffectRecommendation[],
    effectsToApply: EffectRecommendation[],
    classification: MomentClassification
  ): string[] {
    const tradeOffs: string[] = [];

    // Trade-off: Bold vs. Subtle
    if (classification.constraints.stylePreference === 'subtle') {
      tradeOffs.push('Chose subtle style over bold impact to maintain elegance');
    }

    // Trade-off: Pacing vs. Effects
    if (allRecommendations.length > effectsToApply.length) {
      tradeOffs.push(
        `Prioritized pacing over adding ${allRecommendations.length - effectsToApply.length} additional effects`
      );
    }

    // Trade-off: Platform optimization
    if (classification.audience.platform === 'youtube') {
      tradeOffs.push('Optimized for YouTube (longer, more thoughtful editing)');
    } else if (
      classification.audience.platform === 'tiktok' ||
      classification.audience.platform === 'instagram_reels'
    ) {
      tradeOffs.push('Optimized for short-form platforms (quick, punchy effects)');
    }

    return tradeOffs;
  }

  /**
   * Generate feedback hooks for learning
   */
  private generateFeedbackHooks(
    effectsToApply: EffectRecommendation[],
    classification: MomentClassification
  ): EditingDecision['feedbackHooks'] {
    return {
      whatWorked: [
        `Did the ${effectsToApply[0]?.name || 'editing'} enhance the moment?`,
        `Was the pacing appropriate for this ${classification.primaryType}?`,
        `Did the effects feel natural or over-edited?`,
      ],
      whatToImprove: [
        `Should we have added more or fewer effects?`,
        `Was the timing of effects perfect?`,
        `Should we adjust the intensity for future similar moments?`,
      ],
    };
  }

  /**
   * Learn from feedback
   */
  learnFromFeedback(
    decision: EditingDecision,
    feedback: {
      userSatisfaction: number; // 0-1
      reuploadRate: number; // 0-1, did they re-upload?
      shareRate: number; // 0-1, did they share?
      comments: string[];
    }
  ): {
    learnings: string[];
    adjustments: string[];
  } {
    const learnings: string[] = [];
    const adjustments: string[] = [];

    // High satisfaction
    if (feedback.userSatisfaction > 0.8) {
      learnings.push('This effect combination works well for this moment type');
      adjustments.push('Increase confidence in similar recommendations');
    }

    // Low satisfaction
    if (feedback.userSatisfaction < 0.5) {
      learnings.push('This effect combination was not effective');
      adjustments.push('Reduce confidence in similar recommendations');
      adjustments.push('Consider alternative effect combinations');
    }

    // High re-upload rate (they changed it)
    if (feedback.reuploadRate > 0.3) {
      learnings.push('Users are modifying the editing significantly');
      adjustments.push('Make editing more conservative or offer more customization');
    }

    // High share rate (they shared it)
    if (feedback.shareRate > 0.7) {
      learnings.push('This editing drives sharing behavior');
      adjustments.push('Increase boldness in similar moments');
    }

    return { learnings, adjustments };
  }
}

export const editingDecisionEngineService = new EditingDecisionEngineService();
