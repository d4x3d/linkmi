'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import CallbackContent from './CallbackContent';

export default function PaystackCallbackPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-violet-600" />
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
