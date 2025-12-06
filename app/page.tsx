'use client';

import { Authenticated, Unauthenticated } from 'convex/react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import type { User } from '@workos-inc/node';

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        Convex + Next.js + WorkOS
        {user && <UserMenu user={user} onSignOut={signOut} />}
      </header>
      <main className="p-8 flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center">Convex + Next.js + WorkOS</h1>
        <Authenticated>
          <Content />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </>
  );
}

function SignInForm() {
  return (
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <p>Sign in to get started</p>
      <a href="/sign-in">
        <button className="bg-foreground text-background px-4 py-2 rounded-md">Sign in</button>
      </a>
      <a href="/sign-up">
        <button className="bg-foreground text-background px-4 py-2 rounded-md">Sign up</button>
      </a>
    </div>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto">
      <p>Welcome! Your authentication is working.</p>
      <p>Start building your app by adding Convex functions and tables.</p>
    </div>
  );
}

function UserMenu({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{user.email}</span>
      <button onClick={onSignOut} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">
        Sign out
      </button>
    </div>
  );
}
