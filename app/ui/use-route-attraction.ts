"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { getAttraction } from "@/lib/attractions-api";
import { useLoaded } from "@/app/ui/use-loaded";

/**
 * Loads the attraction named by the `[id]` route param.
 * Uses `useParams`, so the calling component must be inside `<Suspense>`.
 */
export function useRouteAttraction() {
  const { id } = useParams<{ id: string }>();
  return useLoaded(useCallback(() => getAttraction(id), [id]));
}
