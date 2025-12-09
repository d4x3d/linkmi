'use client';

import Image from 'next/image';
import LightPillar from '@/components/Lightpillar';
import RotatingText from '@/components/RotatingText';
import GradientText from '@/components/GradientText';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useConvexAuth } from 'convex/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.me);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      if (user === undefined) return; // Still loading user
      if (user === null) {
        router.push('/welcome');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 relative">
      <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <LightPillar
          topColor="#5227FF"
          bottomColor="#FF9FFC"
          intensity={1}
          rotationSpeed={2}
          glowAmount={0.003}
          pillarWidth={3.0}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={240}
          interactive={false}
          mixBlendMode="normal"
        />
      </div>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] lg:w-[700px] px-6 py-4 flex items-center justify-between border border-white/10 bg-white/10 backdrop-blur-md rounded-full z-50">
        <div className="flex items-center gap-2">
          <Image src="/favicon.png" alt="Slobi Logo" width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Slobi
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-3xl space-y-6" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="text-5xl md:text-7xl font-bold text-white chewy-regular leading-tight">
            Your{' '}
            <RotatingText
              texts={['Portfolio', 'Store', 'Community', 'Hub']}
              mainClassName="inline-flex overflow-hidden justify-center"
              staggerFrom="last"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />{' '}
            in One Link
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            <GradientText
              colors={['#5227FF', '#FF9FFC', '#5227FF', '#FF9FFC', '#5227FF']}
              animationSpeed={3}
              showBorder={false}
              className="font-medium"
            >
              A customizable link where you can showcase your work, sell digital products, build your portfolio, and support your community. All in one place.
            </GradientText>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8 text-lg bg-violet-600 hover:bg-violet-700 text-white rounded-full">
                Claim Your Link
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-white" style={{ position: 'relative', zIndex: 1 }}>
        &copy; {new Date().getFullYear()} Slobi. All rights reserved.
      </footer>
    </div>
  );
}
