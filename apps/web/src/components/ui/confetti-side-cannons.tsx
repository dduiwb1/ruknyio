'use client';

/**
 * Confetti Side Cannons Component
 * 
 * Triggers confetti animation from both sides of the screen.
 * Can be auto-triggered on mount or manually triggered.
 */

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiSideCannonsProps {
  autoPlay?: boolean;
  duration?: number;
  onComplete?: () => void;
}

export function ConfettiSideCannons({ 
  autoPlay = false, 
  duration = 3,
  onComplete 
}: ConfettiSideCannonsProps) {
  
  const triggerConfetti = () => {
    const end = Date.now() + duration * 1000;
    const colors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1'];

    const frame = () => {
      if (Date.now() > end) {
        if (onComplete) {
          onComplete();
        }
        return;
      }

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  useEffect(() => {
    if (autoPlay) {
      // Small delay to ensure page is fully rendered
      const timer = setTimeout(() => {
        triggerConfetti();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [autoPlay]);

  return null;
}
