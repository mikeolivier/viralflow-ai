/**
 * Zach King-Style Effects
 * 
 * Implements sophisticated visual tricks inspired by filmmaker Zach King:
 * - Impossible physics and gravity defiance
 * - Seamless transitions and morphs
 * - Object manipulation and teleportation
 * - Perspective tricks and forced perspective
 * - Time manipulation (rewind, fast-forward, freeze)
 * - Portal effects and dimensional shifts
 * - Cloning and duplication
 * - Magical transformations
 * 
 * These effects create "wow" moments that make viewers want to rewatch
 * and share because they can't figure out how it was done.
 */

import { Effect } from './effectSequencer';

export interface ZachKingEffect extends Effect {
  difficulty: 'easy' | 'medium' | 'hard';
  videoMagicRequired: boolean;
  keyframesNeeded: number[];
  maskingRequired: boolean;
  description: string;
}

/**
 * Zach King Effects Service
 * 
 * Generates sophisticated visual tricks for maximum engagement.
 */
export class ZachKingEffectsService {
  /**
   * GRAVITY DEFIANCE EFFECTS
   * Make objects float, levitate, or fall upward
   */

  /**
   * Levitation Effect
   * Makes a person appear to float in mid-air
   */
  createLevitationEffect(
    startTime: number,
    duration: number,
    targetPerson: { x: number; y: number; width: number; height: number }
  ): ZachKingEffect {
    return {
      name: 'levitation',
      type: 'visual',
      startTime,
      duration,
      intensity: 0.9,
      difficulty: 'hard',
      videoMagicRequired: true,
      keyframesNeeded: [0, 0.25, 0.5, 0.75, 1.0],
      maskingRequired: true,
      description: 'Person levitates and floats in mid-air',
      parameters: {
        target: 'person',
        floatHeight: 100, // pixels
        floatSpeed: 0.5, // pixels per frame
        rotationAmount: 5, // degrees
        shadowEffect: true,
        glowEffect: true,
        particleTrail: 'light_particles',
      },
    };
  }

  /**
   * Reverse Gravity Effect
   * Makes objects fall upward instead of downward
   */
  createReverseGravityEffect(
    startTime: number,
    duration: number,
    objects: Array<{ type: string; position: { x: number; y: number } }>
  ): ZachKingEffect {
    return {
      name: 'reverse_gravity',
      type: 'visual',
      startTime,
      duration,
      intensity: 0.85,
      difficulty: 'hard',
      videoMagicRequired: true,
      keyframesNeeded: [0, 0.5, 1.0],
      maskingRequired: false,
      description: 'Objects fall upward defying gravity',
      parameters: {
        objects,
        fallDirection: 'up',
        acceleration: 9.8, // pixels per frame squared
        particleEffect: 'gravity_reverse_particles',
        soundEffect: 'whoosh_reversed',
      },
    };
  }

  /**
   * SEAMLESS TRANSITION EFFECTS
   * Create impossible transitions between scenes
   */

  /**
   * Impossible Doorway
   * A doorway opens to a completely different location
   */
  createImpossibleDoorwayEffect(
    startTime: number,
    duration: number,
    doorPosition: { x: number; y: number; width: number; height: number },
    nextSceneVideo: string
  ): ZachKingEffect {
    return {
      name: 'impossible_doorway',
      type: 'transition',
      startTime,
      duration,
      intensity: 1.0,
      difficulty: 'hard',
      videoMagicRequired: true,
      keyframesNeeded: [0, 0.3, 0.7, 1.0],
      maskingRequired: true,
      description: 'Doorway opens to reveal impossible location',
      parameters: {
        doorPosition,
        doorOpenSpeed: 0.6,
        nextScene: nextSceneVideo,
        lightingAdjustment: true,
        perspectiveWarp: true,
        depthOfField: 'shallow',
      },
    };
  }

  /**
   * Morphing Transition
   * One object smoothly morphs into another
   */
  createMorphingTransitionEffect(
    startTime: number,
    duration: number,
    fromObject: string,
    toObject: string
  ): ZachKingEffect {
    return {
      name: 'morphing_transition',
      type: 'transition',
      startTime,
      duration,
      intensity: 0.95,
      difficulty: 'medium',
      videoMagicRequired: true,
      keyframesNeeded: [0, 0.25, 0.5, 0.75, 1.0],
      maskingRequired: true,
      description: `${fromObject} morphs into ${toObject}`,
      parameters: {
        fromObject,
        toObject,
        morphSpeed: 0.8,
        liquidEffect: true,
        particleTransition: 'morphing_particles',
        soundEffect: 'magical_morph',
      },
    };
  }

  /**
   * Portal Effect
   * A circular portal opens and reveals another location
   */
  createPortalEffect(
    startTime: number,
    duration: number,
    portalPosition: { x: number; y: number; radius: number },
    nextSceneVideo: string
  ): ZachKingEffect {
    return {
      name: 'portal_effect',
      type: 'transition',
      startTime,
      duration,
      intensity: 0.9,
      difficulty: 'hard',
      videoMagicRequired: true,
      keyframesNeeded: [0, 0.2, 0.5, 0.8, 1.0],
      maskingRequired: true,
      description: 'Magical portal opens to another dimension',
      parameters: {
        portalPosition,
        portalColor: '#00D9FF',
        portalGlow: true,
        swirl: true,
        swirlSpeed: 1.2,
        nextScene: nextSceneVideo,
        energyParticles: 'portal_energy',
        soundEffect: 'portal_open',
      },
    };
  }

  /**
   * OBJECT MANIPULATION EFFECTS
   * Make objects do impossible things
   */

  /**
   * Object Teleportation
   * Object instantly appears in a different location
   */
  createTeleportationEffect(
    startTime: number,
    duration: number,
    objectBbox: { x: number; y: number; width: number; height: number },
    targetPosition: { x: number; y: number }
  ): ZachKingEffect {
    return {
      name: 'teleportation',
      type: 'visual',
      startTime,
      duration,
      intensity: 0.85,
      difficulty: 'medium',
      videoMagicRequired: true,
      keyframesNeeded: [0, 0.5, 1.0],
      maskingRequired: true,
      description: 'Object teleports to new location',
      parameters: {
        objectBbox,
        targetPosition,
        teleportEffect: 'sparkle_teleport',
        particleColor: '#FF00FF',
        soundEffect: 'teleport_whoosh',
      },
    };
  }

  /**
   * Cloning Effect
   * Object duplicates and multiplies
   */
  createCloningEffect(
    startTime: number,
    duration: number,
    objectBbox: { x: number; y: number; width: number; height: number },
    cloneCount: number
  ): ZachKingEffect {
    return {
      name: 'cloning',
      type: 'visual',
      startTime,
      duration,
      intensity: 0.8,
      difficulty: 'hard',
      videoMagicRequired: true,
      keyframesNeeded: Array.from({ length: cloneCount }, (_, i) => i / cloneCount),
      maskingRequired: true,
      description: `Object clones into ${cloneCount} copies`,
      parameters: {
        objectBbox,
        cloneCount,
        cloneSpacing: 50,
        cloneAnimation: 'spiral_out',
        particleEffect: 'clone_particles',
        soundEffect: 'clone_multiply',
      },
    };
  }

  /**
   * PERSPECTIVE & FORCED PERSPECTIVE EFFECTS
   * Manipulate perspective to create impossible geometry
   */

  /**
   * Perspective Warp
   * Warps perspective to make objects appear larger/smaller
   */
  createPerspectiveWarpEffect(
    startTime: number,
    duration: number,
    objectBbox: { x: number; y: number; width: number; height: number },
    warpAmount: number
  ): ZachKingEffect {
    return {
      name: 'perspective_warp',
      type: 'visual',
      startTime,
      duration,
      intensity: 0.8,
      difficulty: 'medium',
      videoMagicRequired: true,
      keyframesNeeded: [0, 0.5, 1.0],
      maskingRequired: false,
      description: 'Object warps in perspective',
      parameters: {
        objectBbox,
        warpAmount, // 0-1, where 1 is maximum warp
        warpDirection: 'towards_camera',
        depthShift: true,
        shadowAdjustment: true,
      },
    };
  }

  /**
   * Impossible Geometry
   * Creates impossible architectural structures
   */
  createImpossibleGeometryEffect(
    startTime: number,
    duration: number,
    geometryType: 'escher_stairs' | 'infinite_loop' | 'impossible_triangle'
  ): ZachKingEffect {
    return {
      name: 'impossible_geometry',
      type: 'visual',
      startTime,
      duration,
      intensity: 0.9,
      difficulty: 'hard',
      videoMagicRequired: true,
      keyframesNeeded: [0, 0.25, 0.5, 0.75, 1.0],
      maskingRequired: true,
      description: `Creates ${geometryType} effect`,
      parameters: {
        geometryType,
        perspective: 'isometric',
        lighting: 'dramatic',
        cameraMovement: 'slow_pan',
        particleEffect: 'geometry_particles',
      },
    };
  }

  /**
   * TIME MANIPULATION EFFECTS
   * Play with time in creative ways
   */

  /**
   * Reverse Time
   * Plays video backwards with special effects
   */
  createReverseTimeEffect(
    startTime: number,
    duration: number
  ): ZachKingEffect {
    return {
      name: 'reverse_time',
      type: 'visual',
      startTime,
      duration,
      intensity: 0.8,
      difficulty: 'easy',
      videoMagicRequired: false,
      keyframesNeeded: [0, 1.0],
      maskingRequired: false,
      description: 'Video plays backwards',
      parameters: {
        playbackSpeed: -1.0,
        particleEffect: 'time_reverse_particles',
        soundEffect: 'time_reverse_whoosh',
        colorGrade: 'cool_tint',
      },
    };
  }

  /**
   * Time Freeze with Movement
   * Everything freezes except one object
   */
  createTimeFreezeWithMovementEffect(
    startTime: number,
    duration: number,
    movingObjectBbox: { x: number; y: number; width: number; height: number }
  ): ZachKingEffect {
    return {
      name: 'time_freeze_movement',
      type: 'visual',
      startTime,
      duration,
      intensity: 0.9,
      difficulty: 'hard',
      videoMagicRequired: true,
      keyframesNeeded: [0, 0.5, 1.0],
      maskingRequired: true,
      description: 'Everything freezes except one object',
      parameters: {
        movingObjectBbox,
        freezeEffect: 'blue_tint',
        movingObjectTrail: 'motion_blur',
        particleEffect: 'time_freeze_particles',
      },
    };
  }

  /**
   * MAGICAL TRANSFORMATION EFFECTS
   * Transform objects into other objects
   */

  /**
   * Object Transformation
   * One object transforms into another
   */
  createObjectTransformationEffect(
    startTime: number,
    duration: number,
    fromObject: string,
    toObject: string,
    objectBbox: { x: number; y: number; width: number; height: number }
  ): ZachKingEffect {
    return {
      name: 'object_transformation',
      type: 'visual',
      startTime,
      duration,
      intensity: 0.9,
      difficulty: 'hard',
      videoMagicRequired: true,
      keyframesNeeded: [0, 0.25, 0.5, 0.75, 1.0],
      maskingRequired: true,
      description: `${fromObject} transforms into ${toObject}`,
      parameters: {
        fromObject,
        toObject,
        objectBbox,
        transformationStyle: 'magical_sparkle',
        particleColor: '#FFD700',
        soundEffect: 'magical_transform',
      },
    };
  }

  /**
   * INTERACTION EFFECTS
   * Objects interact in impossible ways
   */

  /**
   * Object Catch
   * Person catches something that shouldn't be catchable
   */
  createObjectCatchEffect(
    startTime: number,
    duration: number,
    personBbox: { x: number; y: number; width: number; height: number },
    objectType: string
  ): ZachKingEffect {
    return {
      name: 'object_catch',
      type: 'visual',
      startTime,
      duration,
      intensity: 0.8,
      difficulty: 'medium',
      videoMagicRequired: true,
      keyframesNeeded: [0, 0.5, 1.0],
      maskingRequired: true,
      description: `Person catches ${objectType}`,
      parameters: {
        personBbox,
        objectType,
        catchEffect: 'sparkle_catch',
        slowMotion: true,
        soundEffect: 'catch_impact',
      },
    };
  }

  /**
   * DETECTION-BASED ZACH KING EFFECTS
   * Automatically apply Zach King effects based on detected moments
   */

  /**
   * Generate Zach King effect for a funny fall moment
   */
  generateZachKingFunnyFall(
    startTime: number,
    duration: number,
    personBbox: { x: number; y: number; width: number; height: number }
  ): ZachKingEffect[] {
    return [
      // Person levitates instead of falling
      this.createLevitationEffect(startTime, duration, personBbox),
      // Add magical sparkle particles
      {
        name: 'magical_sparkles',
        type: 'visual',
        startTime: startTime + 0.1,
        duration: duration - 0.1,
        intensity: 0.7,
        difficulty: 'easy',
        videoMagicRequired: false,
        keyframesNeeded: [],
        maskingRequired: false,
        description: 'Magical sparkle particles',
        parameters: {
          particleCount: 50,
          particleColor: '#FFD700',
          particleSpeed: 2,
        },
      },
    ];
  }

  /**
   * Generate Zach King effect for a reaction moment
   */
  generateZachKingReaction(
    startTime: number,
    duration: number,
    personBbox: { x: number; y: number; width: number; height: number }
  ): ZachKingEffect[] {
    return [
      // Person's face zooms in dramatically
      {
        name: 'face_zoom_dramatic',
        type: 'visual',
        startTime,
        duration,
        intensity: 0.9,
        difficulty: 'easy',
        videoMagicRequired: false,
        keyframesNeeded: [0, 0.5, 1.0],
        maskingRequired: false,
        description: 'Face zooms in dramatically',
        parameters: {
          zoomLevel: 2.0,
          zoomSpeed: 0.8,
          perspective: 'towards_camera',
        },
      },
      // Add mind-blown effect
      {
        name: 'mind_blown',
        type: 'visual',
        startTime: startTime + 0.2,
        duration: 0.6,
        intensity: 0.8,
        difficulty: 'medium',
        videoMagicRequired: true,
        keyframesNeeded: [0, 0.5, 1.0],
        maskingRequired: true,
        description: 'Mind-blown effect with particles',
        parameters: {
          particleType: 'explosion_particles',
          particleColor: '#FF00FF',
          soundEffect: 'mind_blown',
        },
      },
    ];
  }

  /**
   * Generate Zach King effect for a pet moment
   */
  generateZachKingPetMoment(
    startTime: number,
    duration: number,
    petBbox: { x: number; y: number; width: number; height: number }
  ): ZachKingEffect[] {
    return [
      // Pet transforms into something cute
      this.createObjectTransformationEffect(
        startTime,
        duration,
        'pet',
        'cute_character',
        petBbox
      ),
      // Add magical aura
      {
        name: 'magical_aura',
        type: 'visual',
        startTime,
        duration,
        intensity: 0.7,
        difficulty: 'medium',
        videoMagicRequired: false,
        keyframesNeeded: [0, 0.5, 1.0],
        maskingRequired: true,
        description: 'Magical aura around pet',
        parameters: {
          auraColor: '#FF69B4',
          auraSize: 1.3,
          glowIntensity: 0.8,
        },
      },
    ];
  }

  /**
   * Generate Zach King effect for a transition moment
   */
  generateZachKingTransition(
    startTime: number,
    duration: number,
    nextSceneVideo: string
  ): ZachKingEffect[] {
    return [
      // Portal transition to next scene
      this.createPortalEffect(
        startTime,
        duration,
        { x: 640, y: 360, radius: 200 },
        nextSceneVideo
      ),
    ];
  }

  /**
   * Export Zach King effects to FFmpeg filter graph
   */
  exportToFFmpegFilterGraph(effects: ZachKingEffect[]): string {
    const filters: string[] = [];

    effects.forEach(effect => {
      switch (effect.name) {
        case 'levitation':
          filters.push('scale=iw:ih,setpts=N/(FRAME_RATE/TB)');
          break;
        case 'reverse_gravity':
          filters.push('vflip');
          break;
        case 'reverse_time':
          filters.push('reverse');
          break;
        case 'perspective_warp':
          filters.push('perspective=x0=0:y0=0:x1=w:y1=0:x2=0:y2=h:x3=w:y3=h');
          break;
      }
    });

    return filters.join(',');
  }
}

export const zachKingEffectsService = new ZachKingEffectsService();
