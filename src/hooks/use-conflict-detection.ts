"use client";

import { useQuery } from "@tanstack/react-query";
import { useTripDataStore } from "@/store/trip-data-store";
import { useUiStore } from "@/store/ui-store";
import { buildConflictContext } from "@/lib/ai/context-builder";
import type { ConflictDetectionResponse } from "@/lib/ai/types";

export function useConflictDetection(dayId: string) {
  const { getDay, getCity, getActivitiesForDay, reservations } =
    useTripDataStore();
  const { aiEnabled } = useUiStore();
  const day = getDay(dayId);
  const city = day ? getCity(day.cityId) : undefined;
  const activities = getActivitiesForDay(dayId);

  // Build a stable key from activity IDs + their start times to detect changes
  const activitiesKey = activities
    .map((a) => `${a.id}:${a.startTime || ""}:${a.durationMinutes}`)
    .join(",");

  return useQuery<ConflictDetectionResponse>({
    queryKey: ["ai-conflicts", dayId, activitiesKey],
    queryFn: async () => {
      if (!day || !city || activities.length === 0) {
        return { conflicts: [] };
      }

      const context = buildConflictContext(day, activities, city, reservations);
      const response = await fetch("/api/ai/conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error || "Failed to detect conflicts"
        );
      }

      return response.json() as Promise<ConflictDetectionResponse>;
    },
    enabled: aiEnabled && !!day && !!city && activities.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
