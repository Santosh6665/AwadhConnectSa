
'use client';

import { useState, useEffect } from 'react';
import type { ResultVisibilitySettings } from '@/lib/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function useResultVisibility() {
  const [settings, setSettings] = useState<ResultVisibilitySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'resultVisibility');
    
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as ResultVisibilitySettings);
      } else {
        // Default settings if none are found in the database
        setSettings({
          showQuarterly: true,
          showHalfYearly: true,
          showAnnual: true,
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch real-time visibility settings:", error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return { settings, loading };
}
