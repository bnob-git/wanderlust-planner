"use client";

import { useTripDataStore } from "@/store/trip-data-store";
import { useUpdateDayStatus } from "@/hooks/use-trip-mutations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimeBlockSection } from "./time-block-section";
import { formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Day } from "@/types";
import { ConflictAlerts } from "./conflict-alerts";
import { OptimizeRouteButton } from "./optimize-route-button";
import { NaturalLanguageInput } from "./natural-language-input";
import {
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  MapPin,
  Plane,
  Train,
} from "lucide-react";

interface DayCardProps {
  day: Day;
  isExpanded: boolean;
  onToggle: () => void;
  isCompact?: boolean;
}

function classifyDay(
  activityCount: number,
  hasTransportType: boolean
): "travel" | "heavy" | "light" | "normal" {
  if (hasTransportType) return "travel";
  if (activityCount >= 5) return "heavy";
  if (activityCount <= 1) return "light";
  return "normal";
}

const dayTypeStyles = {
  travel: "border-l-4 border-l-blue-400",
  heavy: "border-l-4 border-l-orange-400",
  light: "border-l-4 border-l-gray-200 dark:border-l-gray-700",
  normal: "border-l-4 border-l-transparent",
};

export function DayCard({
  day,
  isExpanded,
  onToggle,
  isCompact = false,
}: DayCardProps) {
  const { getCity, getActivitiesForTimeBlock, getLodging } =
    useTripDataStore();
  const updateDayStatusMutation = useUpdateDayStatus();

  const city = getCity(day.cityId);
  const lodging = day.lodgingId ? getLodging(day.lodgingId) : undefined;

  const allActivities = day.timeBlocks.flatMap((tb) =>
    getActivitiesForTimeBlock(tb.id)
  );
  const totalEstimate = allActivities.reduce(
    (sum, a) => sum + (a.cost?.amount || 0),
    0
  );

  const hasTransportType = allActivities.some(
    (a) => a.type === "transport" || a.type === "transit"
  );
  const dayType = classifyDay(allActivities.length, hasTransportType);

  const confirmedCount = allActivities.filter(
    (a) => a.status === "booked" || a.status === "confirmed"
  ).length;

  const previewActivities = allActivities
    .slice(0, 3)
    .map((a) => a.name);

  const isLocked = day.status === "locked";

  return (
    <Card
      className={cn(
        "transition-all",
        dayTypeStyles[dayType],
        isLocked && "border-green-200 bg-green-50/30 dark:bg-green-950/10",
        dayType === "light" && !isLocked && "opacity-80"
      )}
    >
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">Day {day.dayNumber}</span>
            <span className="text-muted-foreground hidden sm:inline">
              {formatDate(day.date, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-muted-foreground sm:hidden">
              {formatDate(day.date, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            {isLocked && <Lock className="h-4 w-4 text-green-600" />}
            {dayType === "travel" && (
              <Badge variant="secondary" className="text-xs gap-1">
                {hasTransportType && allActivities.some((a) => a.type === "transport") ? (
                  <Plane className="h-3 w-3" />
                ) : (
                  <Train className="h-3 w-3" />
                )}
                Travel Day
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{city?.name}</span>
            {day.theme && (
              <>
                <span className="hidden sm:inline">-</span>
                <span className="italic hidden sm:inline">{day.theme}</span>
              </>
            )}
          </div>
          {!isExpanded && previewActivities.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {previewActivities.join(" · ")}
              {allActivities.length > 3 &&
                ` +${allActivities.length - 3} more`}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-sm shrink-0">
          {day.weather && (
            <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
              <span>{day.weather.highC}°C</span>
            </div>
          )}
          <div className="text-muted-foreground text-xs sm:text-sm">
            {confirmedCount > 0 && (
              <span className="text-green-600 mr-1">
                {confirmedCount}/{allActivities.length}
              </span>
            )}
            {confirmedCount === 0 && (
              <span>{allActivities.length} activities</span>
            )}
          </div>
          {totalEstimate > 0 && (
            <div className="text-muted-foreground hidden sm:block">
              ~{formatCurrency(totalEstimate, day.budgetEstimate.currency)}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              updateDayStatusMutation.mutate({
                dayId: day.id,
                status: isLocked ? "planned" : "locked",
                tripId: day.tripId,
              });
            }}
          >
            {isLocked ? (
              <Lock className="h-4 w-4 text-green-600" />
            ) : (
              <Unlock className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <CardContent className="pt-0 pb-4">
          <ConflictAlerts dayId={day.id} />
          {lodging && (
            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{lodging.name}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-muted-foreground">
                  {lodging.location.address}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end mb-2">
            <OptimizeRouteButton day={day} />
          </div>

          <div className="space-y-6">
            {day.timeBlocks.map((timeBlock) => (
              <TimeBlockSection
                key={timeBlock.id}
                timeBlock={timeBlock}
                dayId={day.id}
                isLocked={isLocked}
                isCompact={isCompact}
              />
            ))}
          </div>

          {!isLocked && <NaturalLanguageInput day={day} />}

          {day.notes.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
              <p className="text-sm font-medium mb-1">Notes</p>
              {day.notes.map((note) => (
                <p key={note.id} className="text-sm text-muted-foreground">
                  {note.content}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
