'use client';

import React from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { WelcomeGuard } from './WelcomeGuard';

function WelcomeContent() {
  const [slug, setSlug] = React.useState('');
  const [error, setError] = React.useState('');
  const createUser = useMutation(api.users.createUser);
  const router = useRouter();

  const handleCreatePage = async () => {
    try {
      if (!slug || slug.length < 3) {
        setError('Username must be at least 3 characters long.');
        return;
      }
      await createUser({ slug });
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Username already taken')) {
        setError('This username is already taken. Please choose another one.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
      <Card className="w-full max-w-[450px] mx-auto">
        <CardHeader className="flex flex-col items-center space-y-2 px-4 sm:px-6">
          <Image src="/favicon.png" alt="Slobi Logo" width={48} height={48} className="rounded-xl mb-2" />
          <CardTitle className="text-xl sm:text-2xl text-center">Welcome to Slobi</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Let&apos;s get you set up. Choose a unique username to create your public page.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                Your Username
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-neutral-500 font-medium text-sm whitespace-nowrap">
                  slobi.vercel.app/
                </span>
                <Input
                  type="text"
                  placeholder="username"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreatePage();
                    }
                  }}
                  className="flex-1"
                  autoFocus
                />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Use only lowercase letters, numbers, and hyphens
              </p>
            </div>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-4 sm:px-6">
          <Button 
            onClick={handleCreatePage} 
            className="w-full bg-violet-600 hover:bg-violet-700"
            disabled={!slug || slug.length < 3}
          >
            Create Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <WelcomeGuard>
      <WelcomeContent />
    </WelcomeGuard>
  );
}
