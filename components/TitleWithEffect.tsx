'use client';

import { useEffect, useState } from 'react';
import Typewriter from 'typewriter-effect';

interface TitleWithEffectProps {
  title: string;
  effect: string;
  textColor: string;
  className?: string;
}

export default function TitleWithEffect({ title, effect, textColor, className }: TitleWithEffectProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SSR fallback
  if (!isMounted) {
    return (
      <h1 className={`text-3xl font-extrabold tracking-tight mb-2 ${className}`} style={{ color: textColor }}>
        {title}
      </h1>
    );
  }

  if (effect === 'typewriter') {
    return (
      <h1 className={`text-3xl font-extrabold tracking-tight mb-2 ${className}`} style={{ color: textColor }}>
        <Typewriter
          options={{
            strings: [title],
            autoStart: true,
            loop: true,
            delay: 80,
            deleteSpeed: 50,
          }}
        />
      </h1>
    );
  }

  // Default: no effect
  return (
    <h1 className={`text-3xl font-extrabold tracking-tight mb-2 ${className}`} style={{ color: textColor }}>
      {title}
    </h1>
  );
}
