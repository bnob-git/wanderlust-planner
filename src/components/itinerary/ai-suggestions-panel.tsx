"use client";

import { useState } from "react";
import { useAiSuggestions } from "@/hooks/use-ai-suggestions";
import { useAddActivity } from "@/hooks/use-trip-mutations";
import { useTripDataStore } from "@/store/trip-data-store";
import { useUiStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Suggestion } from "@/lib/ai/types";
import type { TimeBlock } from "@/types";
import { Sparkles, Plus, Loader2, X } from "lucide-react";

interface AiSuggestionsPanelProps {
  dayId: string;
  timeBlock: TimeBlock;
}

export function AiSuggestionsPanel({
  dayId,
  timeBlock,
}: AiSuggestionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fetchEnabled, setFetchEnabled] = useState(false);
  const { aiEnabled, dismissedSuggestions, dismissSuggestion } = useUiStore();
  const { trip } = useTripDataStore();
  const addActivityMutation = useAddActivity();
  const { data, isLoading, error, refetch } = useAiSuggestions(
    dayId,
    timeBlock.type,
    fetchEnabled
  );

  if (!aiEnabled) return null;

  const handleOpen = () => {
    setIsOpen(true);
    setFetchEnabled(true);
    if (!data && !isLoading) {
      refetch();
    }
  };

  const handleAddSuggestion = (suggestion: Suggestion) => {
    if (!trip) return;

    const activities = useTripDataStore.getState().getActivitiesForTimeBlock(timeBlock.id);
    addActivityMutation.mutate({
      tripId: trip.id,
      dayId,
      timeBlockId: timeBlock.id,
      name: suggestion.name,
      type: suggestion.type,
      description: suggestion.description,
      durationMinutes: suggestion.estimatedDuration,
      isFlexible: true,
      status: "idea",
      tags: suggestion.tags,
      priority: "should_do",
      costSplit: "all",
      order: activities.length,
    });

    dismissSuggestion(`${dayId}:${timeBlock.id}:${suggestion.name}`);
  };

  const visibleSuggestions = (data?.suggestions ?? []).filter(
    (s) =>
      !dismissedSuggestions.includes(
        `${dayId}:${timeBlock.id}:${s.name}`
      )
  );

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs gap-1 text-purple-400 hover:text-purple-300"
        onClick={handleOpen}
      >
        <Sparkles className="h-3 w-3" />
        AI Suggestions
      </Button>
    );
  }

  return (
    <div className="mt-3 border border-purple-200 dark:border-purple-800 rounded-lg p-3 bg-purple-50/50 dark:bg-purple-950/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
          <Sparkles className="h-4 w-4" />
          AI Suggestions
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating suggestions...</span>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 py-2">
          Failed to load suggestions. Please try again.
        </p>
      )}

      {!isLoading && visibleSuggestions.length === 0 && !error && (
        <p className="text-xs text-muted-foreground py-2">
          No more suggestions available.
        </p>
      )}

      <div className="space-y-2">
        {visibleSuggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.name}-${index}`}
            className="flex items-start gap-3 p-2 rounded-md bg-white dark:bg-gray-900 border"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{suggestion.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {suggestion.description}
              </p>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {suggestion.estimatedDuration} min
                </Badge>
                {suggestion.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 italic">
                {suggestion.reason}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={() => handleAddSuggestion(suggestion)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
