'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const user = useQuery(api.users.me);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for user data to load
    if (user === undefined) return;

    // If no user found, redirect to sign-in
    if (user === null) {
      router.push('/sign-in');
      return;
    }

    // If user doesn't have a slug, redirect to welcome page
    if (!user.slug) {
      router.push('/welcome');
      return;
    }
  }, [user, router, pathname]);

  // Show loading state while checking
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user or no slug, don't render children (redirect will happen)
  if (!user || !user.slug) {
    return null;
  }

  return <>{children}</>;
}
