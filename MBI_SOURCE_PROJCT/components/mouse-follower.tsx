// ```tsx
"use client"

import { useEffect, useState } from 'react';

export function MouseFollower() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Throttle updates with requestAnimationFrame for performance
      requestAnimationFrame(() => {
        setMousePosition({ x: event.clientX, y: event.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 opacity-50 z-50 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out"
    //   className="fixed pointer-events-none w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500 opacity-20 z-50 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out"
      style={{ top: `${mousePosition.y}px`, left: `${mousePosition.x}px` }}
      aria-hidden="true"
    />
  );
}
// ```