"use client";

/**
 * Generic async-resource hook shared by every domain-specific hook file
 * (`hooks/use-prediction.ts`, `hooks/use-analytics.ts`). One
 * implementation of fetch/loading/error/retry/auto-refresh, reused
 * rather than duplicated per domain.
 */

import * as React from "react";

export interface AsyncResult<T> {
  ok: true;
  data: T;
}

export interface AsyncError {
  ok: false;
  error: { message: string };
}

export type AsyncOutcome<T> = AsyncResult<T> | AsyncError;

export interface UseAsyncResourceResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export interface UseAsyncResourceOptions {
  /** Auto-refresh cadence in ms. `null` fetches once and never refreshes. */
  intervalMs?: number | null;
  /** Set false to skip fetching entirely. */
  enabled?: boolean;
}

const DEFAULT_INTERVAL_MS = 20_000;

/** Generic fetch/loading/error/retry/auto-refresh hook. */
export function useAsyncResource<T>(
  fetcher: () => Promise<AsyncOutcome<T>>,
  options?: UseAsyncResourceOptions,
): UseAsyncResourceResult<T> {
  const intervalMs = options?.intervalMs === undefined ? DEFAULT_INTERVAL_MS : options.intervalMs;
  const enabled = options?.enabled ?? true;

  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryNonce, setRetryNonce] = React.useState(0);

  const retry = React.useCallback(() => setRetryNonce((n) => n + 1), []);

  React.useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function run() {
      setLoading((prev) => (prev ? prev : true));
      const result = await fetcher();
      if (cancelled) return;
      if (result.ok) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    }

    void run();

    if (!intervalMs) {
      return () => {
        cancelled = true;
      };
    }

    const id = setInterval(() => void run(), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // fetcher is intentionally excluded: callers memoize it with
    // useCallback against their own real dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs, retryNonce]);

  return { data, loading, error, retry };
}
