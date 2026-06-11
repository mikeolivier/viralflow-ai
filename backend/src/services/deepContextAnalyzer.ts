/**
 * Deep Context Analyzer
 * 
 * Understands the deeper meaning and context of video scenes:
 * - Emotional context (what does the viewer feel?)
 * - Narrative context (where in the story are we?)
 * - Visual context (what objects and compositions are present?)
 * - Temporal context (is this a peak moment or transition?)
 * - Audience context (what will resonate with viewers?)
 * 
 * This is the foundation of intelligent editing decisions.
 * A talented editor understands context before choosing effects.
 */

export interface EmotionalContext {
  primaryEmotion: 'joy' | 'surprise' | 'fear' | 'sadness' | 'anger' | 'anticipation' | 'neutral';
  secondaryEmotions: string[];
  emotionalIntensity: number; // 0-1
  emotionalArc: 'building' | 'peak' | 'declining' | 'flat';
  emotionalShift: boolean; // Does emotion change during this moment?
  shiftType?: 'positive' | 'negative' | 'twist'; // How does it shift?
}

export interface NarrativeContext {
  narrativeFunction: 'setup' | 'buildup' | 'climax' | 'resolution' | 'transition' | 'detail';
  storyImportance: number; // 0-1, how important to overall narrative
  paceFunction: 'accelerate' | 'maintain' | 'decelerate' | 'pause';
  viewerExpectation: 'expected' | 'surprising' | 'shocking';
  payoffPotential: number; // 0-1, how satisfying is this moment?
}

export interface VisualContext {
  composition: 'centered' | 'rule_of_thirds' | 'leading_lines' | 'symmetrical' | 'asymmetrical';
  depth: 'shallow' | 'medium' | 'deep';
  lighting: 'bright' | 'normal' | 'dark' | 'dramatic' | 'backlit';
  colorPalette: string[]; // Dominant colors
  movement: 'static' | 'slow' | 'medium' | 'fast' | 'chaotic';
  focusPoint: { x: number; y: number }; // Where should viewer look?
}

export interface TemporalContext {
  duration: number; // seconds
  pace: 'slow' | 'normal' | 'fast';
  rhythm: 'steady' | 'accelerating' | 'decelerating' | 'irregular';
  isMomentPeak: boolean; // Is this the climax of a moment?
  isTransition: boolean; // Is this a transition point?
  momentPosition: 'early' | 'middle' | 'late'; // Position within moment
}

export interface AudienceContext {
  platform: 'tiktok' | 'instagram_reels' | 'youtube_shorts' | 'youtube' | 'general';
  targetDemographic: 'gen_z' | 'millennials' | 'gen_x' | 'boomers' | 'mixed';
  contentType: 'comedy' | 'drama' | 'action' | 'educational' | 'lifestyle' | 'mixed';
  engagementHook: string; // What makes this shareable?
  viewerRetention: number; // 0-1, likelihood viewer stays watching
}

export interface DeepContext {
  emotional: EmotionalContext;
  narrative: NarrativeContext;
  visual: VisualContext;
  temporal: TemporalContext;
  audience: AudienceContext;
  overallScore: number; // 0-1, how important is this moment?
  reasoning: string; // Explanation of context analysis
}

/**
 * Deep Context Analyzer Service
 * 
 * Analyzes scenes with the depth of a talented video editor.
 */
export class DeepContextAnalyzerService {
  /**
   * Analyze complete context of a scene
   */
  analyzeSceneContext(
    sceneData: {
      duration: number;
      objects: string[];
      people: number;
      facialExpressions: string[];
      motion: number; // 0-1
      colors: string[];
      composition: string;
      audio?: { type: string; intensity: number };
      previousMoment?: DeepContext;
      nextMoment?: DeepContext;
    },
    metadata: {
      platform: string;
      contentType: string;
      targetDemographic: string;
      videoPosition: 'early' | 'middle' | 'late';
    }
  ): DeepContext {
    const emotional = this.analyzeEmotionalContext(sceneData);
    const narrative = this.analyzeNarrativeContext(sceneData, metadata, emotional);
    const visual = this.analyzeVisualContext(sceneData);
    const temporal = this.analyzeTemporalContext(sceneData);
    const audience = this.analyzeAudienceContext(sceneData, metadata);

    const overallScore = this.calculateOverallScore(
      emotional,
      narrative,
      visual,
      temporal,
      audience
    );

    const reasoning = this.generateContextReasoning(
      emotional,
      narrative,
      visual,
      temporal,
      audience
    );

    return {
      emotional,
      narrative,
      visual,
      temporal,
      audience,
      overallScore,
      reasoning,
    };
  }

  /**
   * Analyze emotional context
   * 
   * What does the viewer feel in this moment?
   */
  private analyzeEmotionalContext(sceneData: any): EmotionalContext {
    // Analyze facial expressions
    const expressionMap: Record<string, 'joy' | 'surprise' | 'fear' | 'sadness' | 'anger' | 'anticipation' | 'neutral'> = {
      smile: 'joy',
      laugh: 'joy',
      shock: 'surprise',
      scared: 'fear',
      crying: 'sadness',
      angry: 'anger',
      worried: 'anticipation',
      neutral: 'neutral',
    };

    const expressions = sceneData.facialExpressions || [];
    const primaryEmotion = expressions.length > 0
      ? expressionMap[expressions[0]] || 'neutral'
      : 'neutral';

    // Analyze motion for emotional intensity
    const emotionalIntensity = sceneData.motion || 0;

    // Determine emotional arc based on motion and expressions
    let emotionalArc: 'building' | 'peak' | 'declining' | 'flat' = 'flat';
    if (emotionalIntensity > 0.7) {
      emotionalArc = 'peak';
    } else if (emotionalIntensity > 0.4) {
      emotionalArc = 'building';
    }

    return {
      primaryEmotion,
      secondaryEmotions: expressions.slice(1) || [],
      emotionalIntensity,
      emotionalArc,
      emotionalShift: false,
      shiftType: undefined,
    };
  }

  /**
   * Analyze narrative context
   * 
   * Where in the story are we? What's the purpose of this moment?
   */
  private analyzeNarrativeContext(
    sceneData: any,
    metadata: any,
    emotional: EmotionalContext
  ): NarrativeContext {
    // Determine narrative function based on position and content
    let narrativeFunction: 'setup' | 'buildup' | 'climax' | 'resolution' | 'transition' | 'detail' = 'detail';

    if (metadata.videoPosition === 'early') {
      narrativeFunction = 'setup';
    } else if (metadata.videoPosition === 'middle') {
      if (emotional.emotionalIntensity > 0.7) {
        narrativeFunction = 'climax';
      } else {
        narrativeFunction = 'buildup';
      }
    } else if (metadata.videoPosition === 'late') {
      narrativeFunction = 'resolution';
    }

    // Calculate story importance
    const storyImportance = emotional.emotionalIntensity;

    // Determine pace function
    let paceFunction: 'accelerate' | 'maintain' | 'decelerate' | 'pause' = 'maintain';
    if (emotional.emotionalArc === 'building') {
      paceFunction = 'accelerate';
    } else if (emotional.emotionalArc === 'declining') {
      paceFunction = 'decelerate';
    } else if (emotional.emotionalArc === 'peak') {
      paceFunction = 'pause';
    }

    // Viewer expectation
    const viewerExpectation = emotional.emotionalShift ? 'surprising' : 'expected';

    // Payoff potential
    const payoffPotential = emotional.emotionalIntensity;

    return {
      narrativeFunction,
      storyImportance,
      paceFunction,
      viewerExpectation,
      payoffPotential,
    };
  }

  /**
   * Analyze visual context
   * 
   * How is the scene composed? What's the visual language?
   */
  private analyzeVisualContext(sceneData: any): VisualContext {
    const composition = sceneData.composition || 'asymmetrical';
    const lighting = this.analyzeLighting(sceneData.colors);
    const colorPalette = sceneData.colors || [];
    const movement = this.analyzeMovement(sceneData.motion);

    // Determine depth based on objects
    let depth: 'shallow' | 'medium' | 'deep' = 'medium';
    if (sceneData.objects && sceneData.objects.length > 5) {
      depth = 'deep';
    } else if (sceneData.objects && sceneData.objects.length < 2) {
      depth = 'shallow';
    }

    // Focus point (center for now, could be more sophisticated)
    const focusPoint = { x: 0.5, y: 0.5 };

    return {
      composition,
      depth,
      lighting,
      colorPalette,
      movement,
      focusPoint,
    };
  }

  /**
   * Analyze temporal context
   * 
   * How long is this moment? What's the pace?
   */
  private analyzeTemporalContext(sceneData: any): TemporalContext {
    const duration = sceneData.duration || 1;

    let pace: 'slow' | 'normal' | 'fast' = 'normal';
    if (duration > 3) {
      pace = 'slow';
    } else if (duration < 1) {
      pace = 'fast';
    }

    // Rhythm based on motion
    let rhythm: 'steady' | 'accelerating' | 'decelerating' | 'irregular' = 'steady';
    if (sceneData.motion > 0.7) {
      rhythm = 'accelerating';
    } else if (sceneData.motion < 0.3) {
      rhythm = 'decelerating';
    }

    const isMomentPeak = sceneData.motion > 0.7;
    const isTransition = false; // Would be determined by comparing to adjacent moments

    let momentPosition: 'early' | 'middle' | 'late' = 'middle';
    if (duration < 0.5) {
      momentPosition = 'early';
    } else if (duration > 2) {
      momentPosition = 'late';
    }

    return {
      duration,
      pace,
      rhythm,
      isMomentPeak,
      isTransition,
      momentPosition,
    };
  }

  /**
   * Analyze audience context
   * 
   * What platform? What demographic? What will resonate?
   */
  private analyzeAudienceContext(sceneData: any, metadata: any): AudienceContext {
    const platformMap: Record<string, 'tiktok' | 'instagram_reels' | 'youtube_shorts' | 'youtube' | 'general'> = {
      tiktok: 'tiktok',
      instagram: 'instagram_reels',
      youtube_shorts: 'youtube_shorts',
      youtube: 'youtube',
    };

    const platform = platformMap[metadata.platform] || 'general';

    const demographicMap: Record<string, 'gen_z' | 'millennials' | 'gen_x' | 'boomers' | 'mixed'> = {
      gen_z: 'gen_z',
      millennials: 'millennials',
      gen_x: 'gen_x',
      boomers: 'boomers',
    };

    const targetDemographic = demographicMap[metadata.targetDemographic] || 'mixed';
    const contentType = metadata.contentType || 'mixed';

    // Determine engagement hook
    const engagementHook = this.determineEngagementHook(sceneData, metadata);

    // Viewer retention likelihood
    const viewerRetention = sceneData.motion > 0.5 ? 0.8 : 0.6;

    return {
      platform,
      targetDemographic,
      contentType,
      engagementHook,
      viewerRetention,
    };
  }

  /**
   * Determine what makes this moment shareable
   */
  private determineEngagementHook(sceneData: any, metadata: any): string {
    if (sceneData.facialExpressions?.includes('shock')) {
      return 'Unexpected reaction - viewers want to know why';
    }
    if (sceneData.facialExpressions?.includes('laugh')) {
      return 'Comedic moment - viewers want to laugh too';
    }
    if (sceneData.motion > 0.8) {
      return 'High energy - viewers want the excitement';
    }
    if (sceneData.objects?.includes('pet')) {
      return 'Cute animal - viewers want to see more';
    }
    return 'Interesting moment - viewers want to understand';
  }

  /**
   * Calculate overall importance score
   */
  private calculateOverallScore(
    emotional: EmotionalContext,
    narrative: NarrativeContext,
    visual: VisualContext,
    temporal: TemporalContext,
    audience: AudienceContext
  ): number {
    // Weight different factors
    const weights = {
      emotional: 0.3,
      narrative: 0.25,
      visual: 0.15,
      temporal: 0.15,
      audience: 0.15,
    };

    const emotionalScore = emotional.emotionalIntensity;
    const narrativeScore = narrative.storyImportance;
    const visualScore = 0.5; // Placeholder
    const temporalScore = temporal.isMomentPeak ? 1.0 : 0.5;
    const audienceScore = audience.viewerRetention;

    return (
      emotionalScore * weights.emotional +
      narrativeScore * weights.narrative +
      visualScore * weights.visual +
      temporalScore * weights.temporal +
      audienceScore * weights.audience
    );
  }

  /**
   * Generate human-readable reasoning
   */
  private generateContextReasoning(
    emotional: EmotionalContext,
    narrative: NarrativeContext,
    visual: VisualContext,
    temporal: TemporalContext,
    audience: AudienceContext
  ): string {
    let reasoning = '';

    reasoning += `Emotional: ${emotional.primaryEmotion} (intensity: ${(emotional.emotionalIntensity * 100).toFixed(0)}%) - `;
    reasoning += `Narrative: ${narrative.narrativeFunction} (importance: ${(narrative.storyImportance * 100).toFixed(0)}%) - `;
    reasoning += `Temporal: ${temporal.pace} pace, ${temporal.isMomentPeak ? 'moment peak' : 'not peak'} - `;
    reasoning += `Audience: ${audience.platform}, ${audience.engagementHook}`;

    return reasoning;
  }

  /**
   * Helper: Analyze lighting from colors
   */
  private analyzeLighting(colors: string[]): 'bright' | 'normal' | 'dark' | 'dramatic' | 'backlit' {
    if (!colors || colors.length === 0) return 'normal';

    const brightColors = colors.filter(c => this.isLightColor(c)).length;
    const darkColors = colors.filter(c => this.isDarkColor(c)).length;

    if (brightColors > darkColors) return 'bright';
    if (darkColors > brightColors) return 'dark';
    return 'normal';
  }

  /**
   * Helper: Analyze movement
   */
  private analyzeMovement(motion: number): 'static' | 'slow' | 'medium' | 'fast' | 'chaotic' {
    if (motion < 0.1) return 'static';
    if (motion < 0.3) return 'slow';
    if (motion < 0.6) return 'medium';
    if (motion < 0.85) return 'fast';
    return 'chaotic';
  }

  /**
   * Helper: Check if color is light
   */
  private isLightColor(color: string): boolean {
    // Simplified check - would be more sophisticated in production
    return color.includes('white') || color.includes('yellow') || color.includes('light');
  }

  /**
   * Helper: Check if color is dark
   */
  private isDarkColor(color: string): boolean {
    return color.includes('black') || color.includes('dark') || color.includes('navy');
  }

  /**
   * Compare two contexts to understand emotional arc
   */
  compareContexts(context1: DeepContext, context2: DeepContext): {
    emotionalShift: boolean;
    shiftType: 'positive' | 'negative' | 'twist';
    intensity: number;
  } {
    const emotion1 = context1.emotional.emotionalIntensity;
    const emotion2 = context2.emotional.emotionalIntensity;

    const emotionalShift = Math.abs(emotion1 - emotion2) > 0.2;
    let shiftType: 'positive' | 'negative' | 'twist' = 'positive';

    if (emotion2 > emotion1) {
      shiftType = 'positive';
    } else if (emotion2 < emotion1) {
      shiftType = 'negative';
    } else {
      shiftType = 'twist';
    }

    const intensity = Math.abs(emotion1 - emotion2);

    return { emotionalShift, shiftType, intensity };
  }
}

export const deepContextAnalyzerService = new DeepContextAnalyzerService();
