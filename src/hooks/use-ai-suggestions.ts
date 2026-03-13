"use client";

import { useQuery } from "@tanstack/react-query";
import { useTripDataStore } from "@/store/trip-data-store";
import { useUiStore } from "@/store/ui-store";
import { buildSuggestionsContext } from "@/lib/ai/context-builder";
import type { SuggestionsResponse } from "@/lib/ai/types";

export function useAiSuggestions(
  dayId: string,
  timeBlockType?: string,
  enabled: boolean = false
) {
  const { trip, getDay, getCity, getActivitiesForDay } = useTripDataStore();
  const { aiEnabled } = useUiStore();
  const day = getDay(dayId);
  const city = day ? getCity(day.cityId) : undefined;
  const activities = getActivitiesForDay(dayId);

  return useQuery<SuggestionsResponse>({
    queryKey: ["ai-suggestions", dayId, timeBlockType],
    queryFn: async () => {
      if (!day || !city || !trip) {
        return { suggestions: [] };
      }

      const context = buildSuggestionsContext(
        trip.settings,
        city,
        day,
        activities,
        undefined,
        timeBlockType
      );

      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error || "Failed to get suggestions"
        );
      }

      return response.json() as Promise<SuggestionsResponse>;
    },
    enabled: enabled && aiEnabled && !!day && !!city && !!trip,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
