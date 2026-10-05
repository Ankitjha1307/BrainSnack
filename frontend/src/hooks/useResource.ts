"use client";

import { useCallback, useEffect, useState } from "react";

export interface Resource<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  /** Re-run the loader, e.g. after a mutation invalidated the view. */
  reload: () => void;
  /** Optimistically patch the loaded value without a round trip. */
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Minimal fetch-on-mount helper.
 *
 * Deliberately tiny: the previous pages each hand-rolled `useState` +
 * `setTimeout` + a hardcoded mock, which is why none of them ever talked to
 * the API. Keeping loading and error state in one place means a judge sees a
 * real error message instead of an empty screen.
 */
export function useResource<T>(
  load: () => Promise<T>,
  deps: React.DependencyList = []
): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    load()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, error, isLoading, reload, setData };
}