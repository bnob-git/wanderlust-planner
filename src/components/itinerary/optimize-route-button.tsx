"use client";

import { useState } from "react";
import { useRouteOptimization } from "@/hooks/use-route-optimization";
import { useReorderActivities } from "@/hooks/use-trip-mutations";
import { useTripDataStore } from "@/store/trip-data-store";
import { useUiStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Day } from "@/types";
import { Route, Loader2, ArrowRight, Clock } from "lucide-react";
import { toast } from "sonner";

interface OptimizeRouteButtonProps {
  day: Day;
}

export function OptimizeRouteButton({ day }: OptimizeRouteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fetchEnabled, setFetchEnabled] = useState(false);
  const { aiEnabled } = useUiStore();
  const { trip, getActivitiesForDay } = useTripDataStore();
  const reorderActivitiesMutation = useReorderActivities();
  const activities = getActivitiesForDay(day.id);
  const { data, isLoading, error, refetch } = useRouteOptimization(
    day.id,
    fetchEnabled
  );

  if (!aiEnabled || activities.length < 3) return null;

  const handleOpen = () => {
    setIsOpen(true);
    setFetchEnabled(true);
    if (!data && !isLoading) {
      refetch();
    }
  };

  const handleApply = () => {
    if (!data?.optimizedOrder || !trip) return;

    // Group activities by time block and apply the new order
    const timeBlockMap = new Map<string, string[]>();
    for (const actId of data.optimizedOrder) {
      const activity = activities.find((a) => a.id === actId);
      if (activity) {
        const existing = timeBlockMap.get(activity.timeBlockId) ?? [];
        existing.push(activity.id);
        timeBlockMap.set(activity.timeBlockId, existing);
      }
    }

    for (const [timeBlockId, activityIds] of timeBlockMap) {
      reorderActivitiesMutation.mutate({
        timeBlockId,
        activityIds,
        tripId: trip.id,
      });
    }

    toast.success(
      `Route optimized! Estimated ${data.estimatedTimeSaved} minutes saved.`
    );
    setIsOpen(false);
  };

  const getOptimizedActivities = () => {
    if (!data?.optimizedOrder) return [];
    return data.optimizedOrder
      .map((id) => activities.find((a) => a.id === id))
      .filter(Boolean);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs gap-1 text-blue-400 hover:text-blue-300"
        onClick={handleOpen}
      >
        <Route className="h-3 w-3" />
        Optimize Route
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogClose onClose={() => setIsOpen(false)} />
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Route Optimization
            </DialogTitle>
          </DialogHeader>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing routes...</span>
            </div>
          )}

          {error && (
            <div className="py-4 text-sm text-red-500">
              Failed to optimize route. Please try again.
            </div>
          )}

          {data && !isLoading && (
            <div className="space-y-4">
              {data.estimatedTimeSaved > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-sm text-green-700 dark:text-green-300">
                  <Clock className="h-4 w-4" />
                  <span>
                    Estimated {data.estimatedTimeSaved} minutes saved
                  </span>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Suggested Order
                </p>
                <div className="space-y-1">
                  {getOptimizedActivities().map((activity, index) => (
                    <div
                      key={activity?.id}
                      className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md bg-muted/50"
                    >
                      <span className="text-xs text-muted-foreground font-mono w-5">
                        {index + 1}.
                      </span>
                      <span>{activity?.name}</span>
                      {index < getOptimizedActivities().length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic">
                {data.explanation}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={
                isLoading || !data || data.estimatedTimeSaved === 0
              }
            >
              Apply Optimization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
