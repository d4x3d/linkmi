'use client';

import React from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function WelcomePage() {
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
    <div className="flex items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-900">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to LinkMi</CardTitle>
          <CardDescription>
            Let&apos;s get you set up. Choose a unique username to create your public page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-neutral-500 font-medium">linkmi.app/</span>
              <Input
                type="text"
                placeholder="username"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  setError('');
                }}
                className="flex-1"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreatePage} className="w-full bg-violet-600 hover:bg-violet-700">
            Create Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
