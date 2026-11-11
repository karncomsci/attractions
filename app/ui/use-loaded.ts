"use client";

import { useEffect, useState } from "react";

export type Loaded<T> =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; data: T };

/**
 * Runs `load` on mount and whenever `load` changes, so pass a stable function
 * (module-level or `useCallback`).
 *
 * With cacheComponents, Next hides visited pages instead of unmounting them and
 * re-runs effects when a page is shown again. That makes this refetch on every
 * return to the page, showing the previous data until the fresh copy arrives.
 */
export function useLoaded<T>(load: () => Promise<T>): Loaded<T> {
  const [result, setResult] = useState<{
    load: () => Promise<T>;
    state: Loaded<T>;
  } | null>(null);

  useEffect(() => {
    let active = true;
    load().then(
      (data) => active && setResult({ load, state: { status: "ready", data } }),
      (error) => active && setResult({ load, state: { status: "error", error } }),
    );
    return () => {
      active = false;
    };
  }, [load]);

  // A result for a different `load` (e.g. another id) is stale, not reusable.
  return result?.load === load ? result.state : { status: "loading" };
}
