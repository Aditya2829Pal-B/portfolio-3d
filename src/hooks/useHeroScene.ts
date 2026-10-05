"use client";

import { useState, useEffect, useCallback } from "react";

export type HeroSceneType = 
  | 'morphing' 
  | 'galaxy' 
  | 'geometric' 
  | 'torus-field' 
  | 'metaballs'
  | 'holographic'
  | 'plasma';

export interface HeroSceneConfig {
  id: HeroSceneType;
  name: string;
  description: string;
  colors: string[];
  performance: 'high' | 'medium' | 'low';
}

export const HERO_SCENES: HeroSceneConfig[] = [
  {
    id: 'morphing',
    name: 'Morphing Geometry',
    description: 'Noise-based vertex displacement with Fresnel glow',
    colors: ['#00d4ff', '#a855f7', '#f472b6'],
    performance: 'medium',
  },
  {
    id: 'galaxy',
    name: 'Particle Galaxy',
    description: '15,000 particles in spiral arm formation',
    colors: ['#00d4ff', '#a855f7', '#f472b6', '#34d399'],
    performance: 'high',
  },
  {
    id: 'geometric',
    name: 'Geometric Field',
    description: 'Instanced meshes with physical materials',
    colors: ['#00d4ff', '#a855f7', '#f472b6', '#34d399'],
    performance: 'medium',
  },
  {
    id: 'torus-field',
    name: 'Torus Knot Field',
    description: 'Multiple rotating torus knots with particle streams',
    colors: ['#00d4ff', '#a855f7', '#f472b6'],
    performance: 'medium',
  },
  {
    id: 'metaballs',
    name: 'Metaballs / Fluid',
    description: 'Signed distance field fluid simulation',
    colors: ['#00d4ff', '#a855f7', '#f472b6'],
    performance: 'high',
  },
  {
    id: 'holographic',
    name: 'Holographic Sphere',
    description: 'Iridescent scanline effect with glitch accents',
    colors: ['#00d4ff', '#ffffff', '#a855f7'],
    performance: 'low',
  },
  {
    id: 'plasma',
    name: 'Plasma Volumetric',
    description: 'Volumetric plasma with four-color gradients',
    colors: ['#00d4ff', '#a855f7', '#f472b6', '#34d399'],
    performance: 'medium',
  },
];

export function useHeroScene(autoCycleInterval = 15000) {
  const [activeScene, setActiveScene] = useState<HeroSceneType>('morphing');
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  // Auto-cycle scenes
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      const scenes = HERO_SCENES.map(s => s.id);
      const currentIndex = scenes.indexOf(activeScene);
      const nextIndex = (currentIndex + 1) % scenes.length;
      setActiveScene(scenes[nextIndex]);
    }, autoCycleInterval);

    return () => clearInterval(interval);
  }, [activeScene, isPlaying, autoCycleInterval]);

  const nextScene = useCallback(() => {
    const scenes = HERO_SCENES.map(s => s.id);
    const currentIndex = scenes.indexOf(activeScene);
    setActiveScene(scenes[(currentIndex + 1) % scenes.length]);
  }, [activeScene]);

  const prevScene = useCallback(() => {
    const scenes = HERO_SCENES.map(s => s.id);
    const currentIndex = scenes.indexOf(activeScene);
    setActiveScene(scenes[(currentIndex - 1 + scenes.length) % scenes.length]);
  }, [activeScene]);

  const setScene = useCallback((scene: HeroSceneType) => {
    setActiveScene(scene);
    setShowSelector(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return {
    activeScene,
    isPlaying,
    showSelector,
    setShowSelector,
    nextScene,
    prevScene,
    setScene,
    togglePlay,
    scenes: HERO_SCENES,
  };
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.67);
  const [memory, setMemory] = useState(0);

  useEffect(() => {
    let frames = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measure = (now: number) => {
      frames++;
      const delta = now - lastTime;
      
      if (delta >= 1000) {
        setFps(Math.round(frames * 1000 / delta));
        setFrameTime(delta / frames);
        frames = 0;
        lastTime = now;
      }

      // Memory (if available)
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        setMemory(Math.round(mem.usedJSHeapSize / 1024 / 1024));
      }

      animationId = requestAnimationFrame(measure);
    };

    animationId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return { fps, frameTime, memory };
}

// Reduced motion detection
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

// Intersection observer for scroll-triggered animations
export function useScrollTrigger(
  threshold = 0.1,
  rootMargin = '0px'
) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return [setRef, isVisible] as const;
}