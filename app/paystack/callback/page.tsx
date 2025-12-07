'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const handleCallback = useAction(api.callback.handleCallback);

  useEffect(() => {
    const reference = searchParams.get('reference');

    if (!reference) {
      setStatus('error');
      setMessage('No payment reference found');
      return;
    }

    // Verify the payment
    handleCallback({ reference })
      .then((result) => {
        if (result.success) {
          setStatus('success');
          setMessage('Payment successful! Thank you for your purchase.');
        } else {
          setStatus('error');
          setMessage('Payment verification failed');
        }
      })
      .catch((error) => {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your payment');
      });
  }, [searchParams, handleCallback]);

  return (
    <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-violet-600" />
          <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
          <p className="text-neutral-500">Please wait while we confirm your transaction</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">Payment Successful!</h2>
          <p className="text-neutral-500 mb-6">{message}</p>
          <p className="text-sm text-neutral-400 mb-6">
            You will receive an email with your purchase details shortly.
          </p>
          <Link href="/">
            <Button className="w-full bg-violet-600 hover:bg-violet-700">Return to Home</Button>
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">Payment Failed</h2>
          <p className="text-neutral-500 mb-6">{message}</p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

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
