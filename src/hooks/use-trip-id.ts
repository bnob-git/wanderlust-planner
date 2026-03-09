"use client";

import { useParams } from "next/navigation";

/**
 * Hook to get the current trip ID from URL params.
 * Used in trip/[tripId]/ route group.
 */
export function useTripId(): string | undefined {
  const params = useParams();
  const tripId = params?.tripId;
  if (typeof tripId === "string") return tripId;
  if (Array.isArray(tripId)) return tripId[0];
  return undefined;
}
