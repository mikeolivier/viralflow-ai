/**
 * Advanced Compositing Engine
 * 
 * Handles complex compositing operations for Zach King effects:
 * - Layer blending and masking
 * - Keyframe animation
 * - Particle system rendering
 * - 3D perspective transformations
 * - Motion tracking and stabilization
 * - Color grading and effects
 * 
 * This is where the magic happens - combining multiple layers
 * and effects to create seamless, professional-looking results.
 */

import { ZachKingEffect } from './zachKingEffects';

export interface CompositeLayer {
  name: string;
  type: 'video' | 'image' | 'effect' | 'text' | 'shape';
  startTime: number;
  duration: number;
  opacity: number;
  blendMode: string;
  transform: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
  };
  mask?: {
    type: 'rectangle' | 'circle' | 'polygon' | 'custom';
    data: any;
  };
}

export interface CompositeProject {
  width: number;
  height: number;
  fps: number;
  duration: number;
  layers: CompositeLayer[];
  effects: ZachKingEffect[];
}

/**
 * Compositing Engine
 * 
 * Renders complex composite effects.
 */
export class CompositingEngine {
  /**
   * Create a layer from video
   */
  createVideoLayer(
    name: string,
    videoPath: string,
    startTime: number,
    duration: number
  ): CompositeLayer {
    return {
      name,
      type: 'video',
      startTime,
      duration,
      opacity: 1,
      blendMode: 'normal',
      transform: {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    };
  }

  /**
   * Create a particle effect layer
   */
  createParticleLayer(
    name: string,
    particleType: string,
    startTime: number,
    duration: number,
    position: { x: number; y: number },
    parameters: Record<string, any>
  ): CompositeLayer {
    return {
      name,
      type: 'effect',
      startTime,
      duration,
      opacity: 0.8,
      blendMode: 'screen', // Additive blending for particles
      transform: {
        x: position.x,
        y: position.y,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    };
  }

  /**
   * Create a mask for selective effect application
   */
  createMask(
    type: 'rectangle' | 'circle' | 'polygon' | 'custom',
    data: any
  ): CompositeLayer['mask'] {
    return { type, data };
  }

  /**
   * Generate FFmpeg filter graph for compositing
   */
  generateCompositeFilterGraph(project: CompositeProject): string {
    const filters: string[] = [];

    // Sort layers by start time
    const sortedLayers = [...project.layers].sort((a, b) => a.startTime - b.startTime);

    // Build filter graph with overlay operations
    let filterGraph = '[0:v]';

    sortedLayers.forEach((layer, index) => {
      if (layer.type === 'video') {
        // Overlay video layer
        filterGraph += `[${index + 1}:v]overlay=x=${layer.transform.x}:y=${layer.transform.y}:enable='between(t,${layer.startTime},${layer.startTime + layer.duration})'[v${index}];`;
        filterGraph = `[v${index}]`;
      } else if (layer.type === 'effect') {
        // Apply effect with blending
        const blendFilter = this.getBlendModeFilter(layer.blendMode);
        filterGraph += `${blendFilter}`;
      }
    });

    return filterGraph;
  }

  /**
   * Get FFmpeg filter for blend mode
   */
  private getBlendModeFilter(blendMode: string): string {
    const blendModes: Record<string, string> = {
      normal: 'copy',
      multiply: 'multiply',
      screen: 'screen',
      overlay: 'overlay',
      add: 'add',
      subtract: 'subtract',
      darken: 'darken',
      lighten: 'lighten',
    };

    return blendModes[blendMode] || 'copy';
  }

  /**
   * Create keyframe animation
   */
  createKeyframeAnimation(
    property: string,
    keyframes: Array<{ time: number; value: any; easing: string }>
  ): string {
    // Generate FFmpeg expression for keyframe animation
    let expression = '';

    for (let i = 0; i < keyframes.length - 1; i++) {
      const current = keyframes[i];
      const next = keyframes[i + 1];

      const timeRange = `between(t,${current.time},${next.time})`;
      const interpolation = this.interpolateValue(current.value, next.value, current.easing);

      expression += `${timeRange}*${interpolation}+`;
    }

    return expression.slice(0, -1); // Remove trailing +
  }

  /**
   * Interpolate between values with easing
   */
  private interpolateValue(from: any, to: any, easing: string): string {
    const easingFunctions: Record<string, string> = {
      linear: `(t-t0)/(t1-t0)`,
      ease_in: `pow((t-t0)/(t1-t0),2)`,
      ease_out: `1-pow(1-(t-t0)/(t1-t0),2)`,
      ease_in_out: `((t-t0)/(t1-t0)<0.5)?2*pow((t-t0)/(t1-t0),2):1-pow(2*(1-(t-t0)/(t1-t0)),2)`,
    };

    const easeFunc = easingFunctions[easing] || easingFunctions['linear'];
    return `${from}+${easeFunc}*(${to}-${from})`;
  }

  /**
   * Apply motion tracking to stabilize footage
   */
  generateMotionTrackingFilter(): string {
    // Use FFmpeg vidstab filter for motion stabilization
    return 'vidstabdetect=stepsize=6:mincontrast=0.3,vidstabtransform=smoothing=10';
  }

  /**
   * Apply color grading
   */
  generateColorGradingFilter(
    saturation: number = 1.0,
    contrast: number = 1.0,
    brightness: number = 0,
    warmth: number = 0
  ): string {
    let filters = [];

    // Saturation
    if (saturation !== 1.0) {
      filters.push(`saturation=${saturation}`);
    }

    // Contrast and brightness
    if (contrast !== 1.0 || brightness !== 0) {
      filters.push(`eq=contrast=${contrast}:brightness=${brightness}`);
    }

    // Warmth (color temperature)
    if (warmth !== 0) {
      const colorShift = warmth > 0 ? `colortemperature=${3000 + warmth * 2000}` : `colortemperature=${3000 + warmth * 2000}`;
      filters.push(colorShift);
    }

    return filters.join(',');
  }

  /**
   * Generate particle system filter
   */
  generateParticleSystemFilter(
    particleType: string,
    count: number,
    color: string,
    duration: number
  ): string {
    // Different particle types
    const particleSystems: Record<string, string> = {
      sparkles: `drawtext=text='*':fontsize=10:fontcolor=${color}:x=rand(0\\,w):y=rand(0\\,h)`,
      explosion: `drawtext=text='*':fontsize=20:fontcolor=${color}:x=rand(0\\,w):y=rand(0\\,h)`,
      portal_energy: `drawtext=text='○':fontsize=15:fontcolor=${color}:x=rand(0\\,w):y=rand(0\\,h)`,
      light_particles: `drawtext=text='·':fontsize=8:fontcolor=${color}:x=rand(0\\,w):y=rand(0\\,h)`,
    };

    return particleSystems[particleType] || particleSystems['sparkles'];
  }

  /**
   * Apply 3D perspective transformation
   */
  generatePerspectiveTransformFilter(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): string {
    return `perspective=x0=${x0}:y0=${y0}:x1=${x1}:y1=${y1}:x2=${x2}:y2=${y2}:x3=${x3}:y3=${y3}`;
  }

  /**
   * Apply morphing/warping effect
   */
  generateMorphingFilter(intensity: number = 0.5): string {
    // Use FFmpeg's displace filter for morphing
    return `displace=x='p(X\\,Y)':y='p(X\\,Y)':edge=wrap`;
  }

  /**
   * Apply glow/bloom effect
   */
  generateGlowEffect(intensity: number = 0.5, color: string = '#FFFFFF'): string {
    // Create glow by blurring and blending
    return `[0:v]split[a][b];[b]blur=sigma=${intensity * 10}[blur];[a][blur]blend=all_mode=screen`;
  }

  /**
   * Apply chromatic aberration (color shift effect)
   */
  generateChromaticAberrationFilter(amount: number = 5): string {
    return `split[r][g][b];[r]scale=iw+${amount}:ih[r];[g]scale=iw:ih[g];[b]scale=iw-${amount}:ih[b];[r][g][b]concat=n=3:v=1:a=0`;
  }

  /**
   * Apply lens distortion
   */
  generateLensDistortionFilter(distortion: number = 0.1): string {
    return `lensdistortion=k1=${distortion}:k2=${distortion * 0.5}`;
  }

  /**
   * Composite multiple effects into final output
   */
  async compositeEffects(
    inputVideo: string,
    effects: ZachKingEffect[],
    outputVideo: string
  ): Promise<string> {
    // Build complete filter graph
    let filterGraph = '';

    effects.forEach((effect, index) => {
      if (effect.name === 'levitation') {
        filterGraph += `[0:v]scale=iw:ih,setpts=N/(FRAME_RATE/TB)[v${index}];`;
      } else if (effect.name === 'reverse_gravity') {
        filterGraph += `[0:v]vflip[v${index}];`;
      } else if (effect.name === 'reverse_time') {
        filterGraph += `[0:v]reverse[v${index}];`;
      }
    });

    return filterGraph;
  }

  /**
   * Render composite to video file
   */
  async renderComposite(
    project: CompositeProject,
    outputPath: string
  ): Promise<void> {
    // Generate filter graph
    const filterGraph = this.generateCompositeFilterGraph(project);

    // Execute FFmpeg with filter graph
    // This would be called with spawn('ffmpeg', [...])
    // For now, just return the filter graph
    console.log(`[Compositing] Filter graph: ${filterGraph}`);
    console.log(`[Compositing] Output: ${outputPath}`);
  }
}

export const compositingEngine = new CompositingEngine();
