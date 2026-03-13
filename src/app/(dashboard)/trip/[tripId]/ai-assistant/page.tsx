"use client";

import { useTripDataStore } from "@/store/trip-data-store";
import { useUiStore } from "@/store/ui-store";
import { useConflictDetection } from "@/hooks/use-conflict-detection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";

function DayConflictsSummary({ dayId }: { dayId: string }) {
  const { data } = useConflictDetection(dayId);
  const { getDay } = useTripDataStore();
  const day = getDay(dayId);

  if (!data?.conflicts || data.conflicts.length === 0 || !day) return null;

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">
        Day {day.dayNumber} - {day.date}
      </p>
      {data.conflicts.map((conflict, index) => (
        <div
          key={`${conflict.activityId}-${index}`}
          className={cn(
            "flex items-start gap-2 px-3 py-2 rounded-md text-sm",
            conflict.severity === "error"
              ? "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200"
              : "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200"
          )}
        >
          <AlertTriangle
            className={cn(
              "h-3 w-3 shrink-0 mt-0.5",
              conflict.severity === "error"
                ? "text-red-500"
                : "text-amber-500"
            )}
          />
          <div>
            <p>{conflict.message}</p>
            {conflict.suggestion && (
              <p className="text-xs opacity-80 mt-0.5">{conflict.suggestion}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AiAssistantPage() {
  const { days } = useTripDataStore();
  const {
    aiEnabled,
    setAiEnabled,
    dismissedConflicts,
    dismissedSuggestions,
    clearDismissedConflicts,
    clearDismissedSuggestions,
  } = useUiStore();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-purple-500" />
        <h1 className="text-2xl font-bold">AI Assistant</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">AI Features</p>
              <p className="text-sm text-muted-foreground">
                Enable or disable AI-powered conflict detection, suggestions,
                and route optimization.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAiEnabled(!aiEnabled)}
              className="gap-2"
            >
              {aiEnabled ? (
                <ToggleRight className="h-6 w-6 text-green-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-muted-foreground" />
              )}
              {aiEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {aiEnabled && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <p className="font-medium">Conflicts Across Trip</p>
                </div>
                {dismissedConflicts.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={clearDismissedConflicts}
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear {dismissedConflicts.length} dismissed
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {days.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No days in your trip yet.
                  </p>
                ) : (
                  days.map((day) => (
                    <DayConflictsSummary key={day.id} dayId={day.id} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="font-medium mb-2">Quick Stats</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">
                    {dismissedConflicts.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dismissed conflicts
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">
                    {dismissedSuggestions.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dismissed suggestions
                  </p>
                </div>
              </div>
              {dismissedSuggestions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1 mt-2"
                  onClick={clearDismissedSuggestions}
                >
                  <Trash2 className="h-3 w-3" />
                  Clear dismissed suggestions
                </Button>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
