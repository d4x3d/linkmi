'use client';

import { useEffect, useRef } from 'react';

interface MeshBackgroundProps {
  colors: string[];
  speed?: number;
}

export default function MeshBackground({ colors, speed = 0.008 }: MeshBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    // Initialize blobs
    // Create 4-5 moving points using the provided colors
    const blobs = colors.map((color) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed * 200, // Velocity scales with speed
      vy: (Math.random() - 0.5) * speed * 200,
      radius: Math.max(width, height) * 0.6, // Large radius for blending
      color: color,
    }));

    // Fill with first color if fewer blobs
    if (blobs.length < 2) {
      blobs.push({
        x: width / 2,
        y: height / 2,
        vx: 0,
        vy: 0,
        radius: width,
        color: colors[0] || '#ffffff',
      });
    }

    const render = () => {
      // Check resize
      if (canvas.width !== width || canvas.height !== height) {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
      }

      // Draw Background Base
      ctx.fillStyle = colors[0];
      ctx.fillRect(0, 0, width, height);

      // Draw Blobs
      blobs.forEach((blob) => {
        // Move
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Bounce off edges (with buffer)
        if (blob.x <= -blob.radius / 2 || blob.x >= width + blob.radius / 2) blob.vx *= -1;
        if (blob.y <= -blob.radius / 2 || blob.y >= height + blob.radius / 2) blob.vy *= -1;

        // Draw Gradient Blob
        const g = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        g.addColorStop(0, blob.color);
        g.addColorStop(1, 'transparent');

        ctx.globalAlpha = 0.8; // Blend
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [colors, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 w-full h-full"
      style={{ filter: 'blur(60px)' }} // heavily blur to create mesh effect
    />
  );
}
