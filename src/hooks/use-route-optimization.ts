"use client";

import { useQuery } from "@tanstack/react-query";
import { useTripDataStore } from "@/store/trip-data-store";
import { useUiStore } from "@/store/ui-store";
import { buildOptimizeRouteContext } from "@/lib/ai/context-builder";
import type { OptimizeRouteResponse } from "@/lib/ai/types";

export function useRouteOptimization(dayId: string, enabled: boolean = false) {
  const { getDay, getCity, getActivitiesForDay, getLodging } =
    useTripDataStore();
  const { aiEnabled } = useUiStore();
  const day = getDay(dayId);
  const city = day ? getCity(day.cityId) : undefined;
  const activities = getActivitiesForDay(dayId);
  const lodging = day?.lodgingId ? getLodging(day.lodgingId) : undefined;

  return useQuery<OptimizeRouteResponse>({
    queryKey: ["ai-optimize-route", dayId],
    queryFn: async () => {
      if (!day || !city || activities.length < 3) {
        return {
          optimizedOrder: activities.map((a) => a.id),
          estimatedTimeSaved: 0,
          explanation: "Not enough activities to optimize.",
        };
      }

      const context = buildOptimizeRouteContext(activities, city, lodging);
      const response = await fetch("/api/ai/optimize-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error || "Failed to optimize route"
        );
      }

      return response.json() as Promise<OptimizeRouteResponse>;
    },
    enabled: enabled && aiEnabled && !!day && !!city && activities.length >= 3,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
