import { useState, useEffect } from 'react';

interface OptimizedImageOptions {
  placeholder?: string;
  quality?: number;
  width?: number;
  height?: number;
}

export function useOptimizedImage(
  src: string,
  options?: OptimizedImageOptions
) {
  const [imageSrc, setImageSrc] = useState<string>(options?.placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError(new Error(`Failed to load image: ${src}`));
      setIsLoading(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageSrc, isLoading, error };
}

/**
 * Generate optimized image URL with query parameters
 */
export function getOptimizedImageUrl(
  src: string,
  options?: OptimizedImageOptions
): string {
  const url = new URL(src, typeof window !== 'undefined' ? window.location.origin : '');

  if (options?.width) {
    url.searchParams.set('w', options.width.toString());
  }

  if (options?.height) {
    url.searchParams.set('h', options.height.toString());
  }

  if (options?.quality) {
    url.searchParams.set('q', Math.min(100, options.quality).toString());
  }

  return url.toString();
}
