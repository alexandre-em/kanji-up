import { load } from '@kanjiup/recognition';
import { useEffect, useState } from 'react';

// Module scope, not component state: native load() re-instantiates a real TFLite model (mmap +
// interpreter alloc) every time it's called, with no built-in idempotency guard. Caching this at
// module scope means it survives remounts — react-navigation's native-stack unmounts the
// evaluation screens whenever they lose focus, so component state alone would reload the model on
// every single visit.
let loadPromise: Promise<void> | null = null;
let isModelLoaded = false;

function ensureModelLoaded(): Promise<void> {
  if (!loadPromise) {
    loadPromise = load()
      .then(() => {
        isModelLoaded = true;
      })
      .catch((error) => {
        // Let the next mount retry instead of permanently failing for the rest of the app session
        loadPromise = null;
        throw error;
      });
  }

  return loadPromise;
}

export function useRecognitionModel() {
  const [isLoaded, setIsLoaded] = useState(isModelLoaded);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isModelLoaded) return;

    let cancelled = false;

    ensureModelLoaded()
      .then(() => {
        if (!cancelled) setIsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isLoaded, hasError };
}
