"use client";

import { useState } from "react";
import { useTripDataStore } from "@/store/trip-data-store";
import { useUiStore } from "@/store/ui-store";
import { useAddActivity } from "@/hooks/use-trip-mutations";
import { buildParseActivityContext } from "@/lib/ai/context-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ParsedActivity, ParseActivityResponse } from "@/lib/ai/types";
import type { Day, TimeBlock } from "@/types";
import { Wand2, Loader2, Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";

interface NaturalLanguageInputProps {
  day: Day;
}

export function NaturalLanguageInput({ day }: NaturalLanguageInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedActivity, setParsedActivity] = useState<ParsedActivity | null>(
    null
  );
  const { trip, getCity, getActivitiesForDay } = useTripDataStore();
  const { aiEnabled } = useUiStore();
  const addActivityMutation = useAddActivity();

  if (!aiEnabled) return null;

  const city = getCity(day.cityId);

  const handleSubmit = async () => {
    if (!input.trim() || !trip || !city) return;

    setIsLoading(true);
    try {
      const activities = getActivitiesForDay(day.id);
      const context = buildParseActivityContext(
        input,
        day,
        city,
        activities,
        trip.settings
      );

      const response = await fetch("/api/ai/parse-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error || "Failed to parse activity"
        );
      }

      const data = (await response.json()) as ParseActivityResponse;
      setParsedActivity(data.activity);
    } catch (error) {
      const err = error as { message?: string };
      toast.error("Failed to parse activity", {
        description: err.message || "Please try again with a different description.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeBlockForStartTime = (startTime?: string): TimeBlock => {
    if (!startTime) return day.timeBlocks[0];

    const [hours] = startTime.split(":").map(Number);
    const timeBlocks = trip?.settings.timeBlocks;

    if (timeBlocks) {
      const morningStart = parseInt(timeBlocks.morning.start.split(":")[0]);
      const afternoonStart = parseInt(timeBlocks.afternoon.start.split(":")[0]);
      const eveningStart = parseInt(timeBlocks.evening.start.split(":")[0]);

      if (hours >= eveningStart) {
        return day.timeBlocks.find((tb) => tb.type === "evening") ?? day.timeBlocks[2];
      } else if (hours >= afternoonStart) {
        return day.timeBlocks.find((tb) => tb.type === "afternoon") ?? day.timeBlocks[1];
      } else if (hours >= morningStart) {
        return day.timeBlocks.find((tb) => tb.type === "morning") ?? day.timeBlocks[0];
      }
    }

    // Default fallback based on hour
    if (hours >= 19) return day.timeBlocks.find((tb) => tb.type === "evening") ?? day.timeBlocks[2];
    if (hours >= 13) return day.timeBlocks.find((tb) => tb.type === "afternoon") ?? day.timeBlocks[1];
    return day.timeBlocks.find((tb) => tb.type === "morning") ?? day.timeBlocks[0];
  };

  const handleConfirm = () => {
    if (!parsedActivity || !trip) return;

    const timeBlock = getTimeBlockForStartTime(parsedActivity.startTime);
    const activities = useTripDataStore
      .getState()
      .getActivitiesForTimeBlock(timeBlock.id);

    addActivityMutation.mutate({
      tripId: trip.id,
      dayId: day.id,
      timeBlockId: timeBlock.id,
      name: parsedActivity.name,
      type: parsedActivity.type,
      description: parsedActivity.description,
      startTime: parsedActivity.startTime,
      durationMinutes: parsedActivity.durationMinutes,
      isFlexible: true,
      status: "idea",
      tags: parsedActivity.tags,
      priority: "should_do",
      costSplit: "all",
      order: activities.length,
      location: parsedActivity.location
        ? { name: parsedActivity.location }
        : undefined,
    });

    setParsedActivity(null);
    setInput("");
    toast.success(`Added "${parsedActivity.name}" to your itinerary`);
  };

  const handleCancel = () => {
    setParsedActivity(null);
  };

  return (
    <div className="mt-4">
      {parsedActivity ? (
        <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-3 bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-purple-700 dark:text-purple-300">
            <Wand2 className="h-4 w-4" />
            Parsed Activity Preview
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-md p-3 border">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{parsedActivity.name}</p>
              <Badge variant="secondary" className="text-[10px]">
                {parsedActivity.type}
              </Badge>
            </div>
            {parsedActivity.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {parsedActivity.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {parsedActivity.startTime && (
                <Badge variant="outline" className="text-[10px]">
                  {parsedActivity.startTime}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px]">
                {parsedActivity.durationMinutes} min
              </Badge>
              {parsedActivity.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px]"
                >
                  {tag}
                </Badge>
              ))}
              {parsedActivity.location && (
                <Badge variant="outline" className="text-[10px]">
                  {parsedActivity.location}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleConfirm}
            >
              <Check className="h-3 w-3 mr-1" />
              Add
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setParsedActivity(null);
              }}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleCancel}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Add dinner near the hotel around 8pm..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) handleSubmit();
              }}
              className="pl-9 text-sm"
              disabled={isLoading}
            />
          </div>
          <Button
            size="sm"
            className="h-9"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
