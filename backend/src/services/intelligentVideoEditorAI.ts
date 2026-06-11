/**
 * Intelligent Video Editor AI
 * 
 * The unified AI that thinks like a talented video editor.
 * 
 * Orchestrates:
 * 1. Deep Context Understanding - What's happening and why?
 * 2. Intelligent Moment Classification - What type of moment is this?
 * 3. Editing Decision Engine - What effects should we apply?
 * 
 * Together, these create an AI that:
 * - Understands emotional and narrative context
 * - Classifies moments with editing intelligence
 * - Makes smart trade-offs about which effects to apply
 * - Learns from user feedback
 * - Continuously improves
 */

import { deepContextAnalyzerService, DeepContext } from './deepContextAnalyzer';
import {
  intelligentMomentClassifierService,
  MomentClassification,
} from './intelligentMomentClassifier';
import {
  editingDecisionEngineService,
  EditingDecision,
} from './editingDecisionEngine';

export interface VideoAnalysisResult {
  videoId: string;
  duration: number;
  moments: MomentAnalysis[];
  overallEditingStrategy: string;
  estimatedEngagement: number;
  estimatedShareability: number;
  estimatedViewerRetention: number;
  recommendations: string[];
}

export interface MomentAnalysis {
  startTime: number;
  endTime: number;
  context: DeepContext;
  classification: MomentClassification;
  editingDecision: EditingDecision;
  confidence: number;
}

export interface EditingReport {
  videoId: string;
  totalMoments: number;
  totalEffects: number;
  estimatedRenderTime: number;
  editingStrategy: string;
  momentBreakdown: Array<{
    momentType: string;
    count: number;
    totalEffects: number;
  }>;
  recommendations: string[];
  learningInsights: string[];
}

/**
 * Intelligent Video Editor AI Service
 * 
 * The brain of ViralFlow AI.
 */
export class IntelligentVideoEditorAIService {
  /**
   * Analyze a complete video
   */
  async analyzeVideo(
    videoPath: string,
    videoMetadata: {
      platform: string;
      contentType: string;
      targetDemographic: string;
      userPreferences?: {
        boldness: number;
        pacing: number;
        effectDensity: number;
      };
    },
    moments: Array<{
      startTime: number;
      endTime: number;
      sceneData: any;
      description: string;
    }>
  ): Promise<VideoAnalysisResult> {
    const momentAnalyses: MomentAnalysis[] = [];

    // Analyze each moment
    for (const moment of moments) {
      const analysis = await this.analyzeMoment(
        moment,
        videoMetadata,
        moments
      );
      momentAnalyses.push(analysis);
    }

    // Generate overall strategy
    const overallStrategy = this.generateOverallStrategy(momentAnalyses);

    // Calculate aggregate metrics
    const aggregateMetrics = this.calculateAggregateMetrics(momentAnalyses);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      momentAnalyses,
      videoMetadata
    );

    return {
      videoId: videoPath,
      duration: moments[moments.length - 1]?.endTime || 0,
      moments: momentAnalyses,
      overallEditingStrategy: overallStrategy,
      estimatedEngagement: aggregateMetrics.engagement,
      estimatedShareability: aggregateMetrics.shareability,
      estimatedViewerRetention: aggregateMetrics.viewerRetention,
      recommendations,
    };
  }

  /**
   * Analyze a single moment
   */
  private async analyzeMoment(
    moment: {
      startTime: number;
      endTime: number;
      sceneData: any;
      description: string;
    },
    videoMetadata: any,
    allMoments: any[]
  ): Promise<MomentAnalysis> {
    // Step 1: Deep Context Understanding
    const context = deepContextAnalyzerService.analyzeSceneContext(
      moment.sceneData,
      {
        platform: videoMetadata.platform,
        contentType: videoMetadata.contentType,
        targetDemographic: videoMetadata.targetDemographic,
        videoPosition: this.getVideoPosition(moment.startTime, allMoments),
      }
    );

    // Step 2: Intelligent Moment Classification
    const classification = intelligentMomentClassifierService.classifyMoment(
      context,
      moment.description
    );

    // Step 3: Editing Decision Engine
    const editingDecision = editingDecisionEngineService.makeEditingDecisions(
      classification,
      {
        totalDuration: allMoments[allMoments.length - 1]?.endTime || 0,
        currentPosition: moment.startTime,
        previousMoments: [],
        nextMoments: [],
        userPreferences: videoMetadata.userPreferences,
      }
    );

    // Calculate overall confidence
    const confidence = (
      context.overallScore +
      classification.confidence +
      editingDecision.confidence
    ) / 3;

    return {
      startTime: moment.startTime,
      endTime: moment.endTime,
      context,
      classification,
      editingDecision,
      confidence,
    };
  }

  /**
   * Generate overall editing strategy for the video
   */
  private generateOverallStrategy(momentAnalyses: MomentAnalysis[]): string {
    // Count moment types
    const momentTypeCounts: Record<string, number> = {};
    momentAnalyses.forEach(m => {
      momentTypeCounts[m.classification.primaryType] =
        (momentTypeCounts[m.classification.primaryType] || 0) + 1;
    });

    // Find dominant moment type
    const dominantType = Object.entries(momentTypeCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] || 'general';

    // Count total effects
    const totalEffects = momentAnalyses.reduce(
      (sum, m) => sum + m.editingDecision.effectsToApply.length,
      0
    );

    // Determine overall style
    const avgIntensity =
      momentAnalyses.reduce(
        (sum, m) =>
          sum +
          m.editingDecision.effectsToApply.reduce(
            (s, e) => s + e.intensity,
            0
          ),
        0
      ) / (totalEffects || 1);

    let style = 'balanced';
    if (avgIntensity > 0.7) {
      style = 'bold and energetic';
    } else if (avgIntensity < 0.4) {
      style = 'subtle and refined';
    }

    return `This video is primarily ${dominantType} moments with a ${style} editing style. ` +
      `Total of ${totalEffects} effects applied across ${momentAnalyses.length} moments. ` +
      `The editing emphasizes ${this.getEmphasisAreas(momentAnalyses)}.`;
  }

  /**
   * Get emphasis areas
   */
  private getEmphasisAreas(momentAnalyses: MomentAnalysis[]): string {
    const emphasisMap: Record<string, number> = {};

    momentAnalyses.forEach(m => {
      m.editingDecision.effectsToApply.forEach(effect => {
        const area = effect.type;
        emphasisMap[area] = (emphasisMap[area] || 0) + 1;
      });
    });

    const topAreas = Object.entries(emphasisMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([area]) => area);

    return topAreas.join(', ') || 'overall pacing';
  }

  /**
   * Calculate aggregate metrics
   */
  private calculateAggregateMetrics(
    momentAnalyses: MomentAnalysis[]
  ): {
    engagement: number;
    shareability: number;
    viewerRetention: number;
  } {
    const avgEngagement =
      momentAnalyses.reduce((sum, m) => sum + m.editingDecision.estimatedImpact.engagement, 0) /
      momentAnalyses.length;

    const avgShareability =
      momentAnalyses.reduce((sum, m) => sum + m.editingDecision.estimatedImpact.shareability, 0) /
      momentAnalyses.length;

    const avgViewerRetention =
      momentAnalyses.reduce((sum, m) => sum + m.editingDecision.estimatedImpact.viewerRetention, 0) /
      momentAnalyses.length;

    return {
      engagement: Math.min(avgEngagement, 1.0),
      shareability: Math.min(avgShareability, 1.0),
      viewerRetention: Math.min(avgViewerRetention, 1.0),
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    momentAnalyses: MomentAnalysis[],
    videoMetadata: any
  ): string[] {
    const recommendations: string[] = [];

    // Check for over-editing
    const totalEffects = momentAnalyses.reduce(
      (sum, m) => sum + m.editingDecision.effectsToApply.length,
      0
    );

    if (totalEffects > momentAnalyses.length * 3) {
      recommendations.push(
        '⚠️ Video might be over-edited. Consider reducing effect density for a more natural feel.'
      );
    }

    // Check for under-editing
    if (totalEffects < momentAnalyses.length) {
      recommendations.push(
        '💡 Consider adding more effects to key moments to increase engagement.'
      );
    }

    // Platform-specific recommendations
    if (videoMetadata.platform === 'tiktok' || videoMetadata.platform === 'instagram_reels') {
      const avgDuration =
        momentAnalyses.reduce((sum, m) => sum + (m.endTime - m.startTime), 0) /
        momentAnalyses.length;

      if (avgDuration > 3) {
        recommendations.push(
          '⏱️ For TikTok/Reels, consider tightening the pacing. Moments are a bit long.'
        );
      }
    }

    // Check for emotional moments
    const emotionalMoments = momentAnalyses.filter(
      m => m.classification.primaryType.includes('emotional')
    );

    if (emotionalMoments.length > 0) {
      recommendations.push(
        '🎵 Consider adding emotional music to enhance the impact of emotional moments.'
      );
    }

    // Check for comedic moments
    const comedyMoments = momentAnalyses.filter(
      m => m.classification.primaryType.includes('comedic')
    );

    if (comedyMoments.length > 0) {
      recommendations.push(
        '😄 Comedic moments are strong. Ensure timing effects are perfectly synced.'
      );
    }

    // Add generic recommendations
    if (recommendations.length === 0) {
      recommendations.push('✅ Video editing looks great! Ready to publish.');
    }

    return recommendations;
  }

  /**
   * Generate detailed editing report
   */
  generateEditingReport(analysis: VideoAnalysisResult): EditingReport {
    // Count moment types
    const momentTypeCounts: Record<string, number> = {};
    let totalEffects = 0;

    analysis.moments.forEach(m => {
      momentTypeCounts[m.classification.primaryType] =
        (momentTypeCounts[m.classification.primaryType] || 0) + 1;
      totalEffects += m.editingDecision.effectsToApply.length;
    });

    // Create breakdown
    const momentBreakdown = Object.entries(momentTypeCounts).map(
      ([momentType, count]) => ({
        momentType,
        count,
        totalEffects: analysis.moments
          .filter(m => m.classification.primaryType === momentType)
          .reduce((sum, m) => sum + m.editingDecision.effectsToApply.length, 0),
      })
    );

    // Estimate render time (rough estimate: 2s per effect + 1s per moment)
    const estimatedRenderTime = totalEffects * 2 + analysis.moments.length * 1;

    // Generate learning insights
    const learningInsights = this.generateLearningInsights(analysis);

    return {
      videoId: analysis.videoId,
      totalMoments: analysis.moments.length,
      totalEffects,
      estimatedRenderTime,
      editingStrategy: analysis.overallEditingStrategy,
      momentBreakdown,
      recommendations: analysis.recommendations,
      learningInsights,
    };
  }

  /**
   * Generate learning insights
   */
  private generateLearningInsights(analysis: VideoAnalysisResult): string[] {
    const insights: string[] = [];

    // Analyze confidence levels
    const avgConfidence =
      analysis.moments.reduce((sum, m) => sum + m.confidence, 0) /
      analysis.moments.length;

    if (avgConfidence > 0.85) {
      insights.push('🎯 High confidence in editing decisions across all moments.');
    } else if (avgConfidence < 0.6) {
      insights.push('⚠️ Some moments have lower confidence. May need manual review.');
    }

    // Analyze effect distribution
    const effectTypes: Record<string, number> = {};
    analysis.moments.forEach(m => {
      m.editingDecision.effectsToApply.forEach(e => {
        effectTypes[e.type] = (effectTypes[e.type] || 0) + 1;
      });
    });

    const topEffectType = Object.entries(effectTypes).sort(
      ([, a], [, b]) => b - a
    )[0];

    if (topEffectType) {
      insights.push(
        `📊 Most common effect type: ${topEffectType[0]} (${topEffectType[1]} times).`
      );
    }

    // Analyze moment distribution
    const momentTypes: Record<string, number> = {};
    analysis.moments.forEach(m => {
      momentTypes[m.classification.primaryType] =
        (momentTypes[m.classification.primaryType] || 0) + 1;
    });

    const dominantMomentType = Object.entries(momentTypes).sort(
      ([, a], [, b]) => b - a
    )[0];

    if (dominantMomentType) {
      insights.push(
        `🎬 Video is primarily ${dominantMomentType[0]} (${dominantMomentType[1]} moments).`
      );
    }

    return insights;
  }

  /**
   * Get video position (early, middle, late)
   */
  private getVideoPosition(
    currentTime: number,
    allMoments: any[]
  ): 'early' | 'middle' | 'late' {
    const totalDuration = allMoments[allMoments.length - 1]?.endTime || 1;
    const position = currentTime / totalDuration;

    if (position < 0.33) return 'early';
    if (position < 0.67) return 'middle';
    return 'late';
  }

  /**
   * Learn from user feedback
   */
  learnFromUserFeedback(
    analysis: VideoAnalysisResult,
    feedback: {
      userSatisfaction: number;
      reuploadRate: number;
      shareRate: number;
      comments: string[];
    }
  ): {
    learnings: string[];
    improvements: string[];
  } {
    const learnings: string[] = [];
    const improvements: string[] = [];

    if (feedback.userSatisfaction > 0.8) {
      learnings.push('Users love this editing style');
      improvements.push('Increase boldness in similar videos');
    }

    if (feedback.shareRate > 0.7) {
      learnings.push('This editing drives sharing behavior');
      improvements.push('Replicate this effect combination in future videos');
    }

    if (feedback.reuploadRate > 0.3) {
      learnings.push('Users are making significant changes');
      improvements.push('Make editing more customizable or conservative');
    }

    return { learnings, improvements };
  }
}

export const intelligentVideoEditorAIService = new IntelligentVideoEditorAIService();
