'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function ViewTracker({ slug }: { slug: string }) {
  const recordView = useMutation(api.analytics.recordView);
  const hasRecorded = useRef(false);

  useEffect(() => {
    const key = `linkmi_view_${slug}`;
    const hasViewedSession = sessionStorage.getItem(key);

    if (!hasRecorded.current && !hasViewedSession) {
      recordView({ slug })
        .then(() => {
          sessionStorage.setItem(key, 'true');
        })
        .catch((err) => {
          console.error('Failed to record view', err);
        });
      hasRecorded.current = true;
    }
  }, [slug, recordView]);

  return null; // This component renders nothing
}
