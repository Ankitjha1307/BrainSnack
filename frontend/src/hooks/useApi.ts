"use client";

import { useState, useCallback } from "react";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiResult<T, P extends unknown[]> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: (...args: P) => Promise<T | null>;
}

export function useApi<T, P extends unknown[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("An error occurred");
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, options]
  );

  return { data, error, isLoading, execute };
}
