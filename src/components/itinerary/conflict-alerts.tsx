"use client";

import { useConflictDetection } from "@/hooks/use-conflict-detection";
import { useUiStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConflictAlertsProps {
  dayId: string;
}

export function ConflictAlerts({ dayId }: ConflictAlertsProps) {
  const { data, isLoading, error } = useConflictDetection(dayId);
  const { dismissedConflicts, dismissConflict } = useUiStore();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Checking for conflicts...</span>
      </div>
    );
  }

  if (error || !data?.conflicts || data.conflicts.length === 0) {
    return null;
  }

  const visibleConflicts = data.conflicts.filter(
    (c) => !dismissedConflicts.includes(`${dayId}:${c.activityId}:${c.message}`)
  );

  if (visibleConflicts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visibleConflicts.map((conflict, index) => {
        const conflictKey = `${dayId}:${conflict.activityId}:${conflict.message}`;
        return (
          <div
            key={`${conflict.activityId}-${index}`}
            className={cn(
              "flex items-start gap-2 px-3 py-2 rounded-lg border text-sm",
              conflict.severity === "error"
                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200"
                : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200"
            )}
          >
            <AlertTriangle
              className={cn(
                "h-4 w-4 shrink-0 mt-0.5",
                conflict.severity === "error"
                  ? "text-red-500"
                  : "text-amber-500"
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{conflict.message}</p>
              {conflict.suggestion && (
                <p className="text-xs mt-1 opacity-80">{conflict.suggestion}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 opacity-60 hover:opacity-100"
              onClick={() => dismissConflict(conflictKey)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
