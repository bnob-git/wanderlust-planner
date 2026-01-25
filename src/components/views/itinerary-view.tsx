"use client";

import { useState } from "react";
import { useTripStore } from "@/store/trip-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import { ActivityTag } from "@/components/activity-tag";
import { ActivityTypeIcon, TransportTypeIcon } from "@/components/activity-type-icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Day, Activity, TimeBlock, ActivityType } from "@/types";
import {
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  MapPin,
  Clock,
  Plus,
  GripVertical,
  Navigation,
  Phone,
  ExternalLink,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";

const timeBlockIcons = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
  night: Moon,
};

const timeBlockLabels = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
};

interface DayCardProps {
  day: Day;
  isExpanded: boolean;
  onToggle: () => void;
}

function DayCard({ day, isExpanded, onToggle }: DayCardProps) {
  const { getCity, getActivitiesForTimeBlock, getLodging, updateDayStatus } =
    useTripStore();

  const city = getCity(day.cityId);
  const lodging = day.lodgingId ? getLodging(day.lodgingId) : undefined;

  const allActivities = day.timeBlocks.flatMap((tb) =>
    getActivitiesForTimeBlock(tb.id)
  );
  const totalEstimate = allActivities.reduce(
    (sum, a) => sum + (a.cost?.amount || 0),
    0
  );

  const isLocked = day.status === "locked";

  return (
    <Card
      className={cn(
        "transition-all",
        isLocked && "border-green-200 bg-green-50/30 dark:bg-green-950/10"
      )}
    >
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <Button variant="ghost" size="icon" className="h-6 w-6">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Day {day.dayNumber}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {formatDate(day.date, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
            {isLocked && <Lock className="h-4 w-4 text-green-600" />}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{city?.name}</span>
            {day.theme && (
              <>
                <span>•</span>
                <span className="italic">{day.theme}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {day.weather && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>☀️</span>
              <span>{day.weather.highC}°C</span>
            </div>
          )}
          <div className="text-muted-foreground">
            {allActivities.length} activities
          </div>
          {totalEstimate > 0 && (
            <div className="text-muted-foreground">
              ~{formatCurrency(totalEstimate, day.budgetEstimate.currency)}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              updateDayStatus(day.id, isLocked ? "planned" : "locked");
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
          {lodging && (
            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
              <div className="flex items-center gap-2 text-sm">
                <span>🏨</span>
                <span className="font-medium">{lodging.name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {lodging.location.address}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {day.timeBlocks.map((timeBlock) => (
              <TimeBlockSection
                key={timeBlock.id}
                timeBlock={timeBlock}
                dayId={day.id}
                isLocked={isLocked}
              />
            ))}
          </div>

          {day.notes.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
              <p className="text-sm font-medium mb-1">📝 Notes</p>
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

interface TimeBlockSectionProps {
  timeBlock: TimeBlock;
  dayId: string;
  isLocked: boolean;
}

function TimeBlockSection({ timeBlock, dayId, isLocked }: TimeBlockSectionProps) {
  const { getActivitiesForTimeBlock, addActivity, trip } = useTripStore();
  const activities = getActivitiesForTimeBlock(timeBlock.id);
  const Icon = timeBlockIcons[timeBlock.type];
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityType, setNewActivityType] = useState<ActivityType>("sightseeing");
  const [newActivityDuration, setNewActivityDuration] = useState("60");
  const [newActivityDescription, setNewActivityDescription] = useState("");

  const handleAddActivity = () => {
    if (!newActivityName || !trip) return;
    
    addActivity({
      tripId: trip.id,
      dayId,
      timeBlockId: timeBlock.id,
      name: newActivityName,
      type: newActivityType,
      description: newActivityDescription || undefined,
      durationMinutes: parseInt(newActivityDuration) || 60,
      isFlexible: true,
      status: "planned",
      tags: [],
      priority: "should_do",
      costSplit: "all",
      order: activities.length,
    });
    
    setNewActivityName("");
    setNewActivityType("sightseeing");
    setNewActivityDuration("60");
    setNewActivityDescription("");
    setIsAddActivityOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span>{timeBlockLabels[timeBlock.type]}</span>
          <span className="text-muted-foreground font-normal">
            ({timeBlock.timeRange.start} - {timeBlock.timeRange.end})
          </span>
        </div>
        {!isLocked && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsAddActivityOpen(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
          No activities planned
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              showTransit={index < activities.length - 1}
              isLocked={isLocked}
            />
          ))}
        </div>
      )}

      <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsAddActivityOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="activityName">Activity Name</Label>
              <Input
                id="activityName"
                placeholder="e.g., Visit the Prado Museum"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activityType">Type</Label>
                <Select
                  id="activityType"
                  value={newActivityType}
                  onChange={(e) => setNewActivityType(e.target.value as ActivityType)}
                >
                  <option value="sightseeing">Sightseeing</option>
                  <option value="museum">Museum</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="bar">Bar</option>
                  <option value="shopping">Shopping</option>
                  <option value="beach">Beach</option>
                  <option value="park">Park</option>
                  <option value="tour">Tour</option>
                  <option value="show">Show</option>
                  <option value="rest">Rest</option>
                  <option value="free_time">Free Time</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newActivityDuration}
                  onChange={(e) => setNewActivityDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add notes about this activity..."
                value={newActivityDescription}
                onChange={(e) => setNewActivityDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddActivityOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddActivity}>Add Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ActivityCardProps {
  activity: Activity;
  showTransit: boolean;
  isLocked: boolean;
}

function ActivityCard({ activity, showTransit, isLocked }: ActivityCardProps) {
  const { getReservation } = useTripStore();
  const reservation = activity.reservationId
    ? getReservation(activity.reservationId)
    : undefined;

  return (
    <div>
      <div
        className={cn(
          "group flex gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-all",
          activity.status === "confirmed" && "border-green-200",
          activity.status === "canceled" && "opacity-50 line-through"
        )}
      >
        {!isLocked && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        )}

        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex flex-col items-center">
            {activity.startTime && (
              <span className="text-sm font-medium">
                {formatTime(activity.startTime)}
              </span>
            )}
            <div className="mt-1 p-2 rounded-lg bg-muted">
              <ActivityTypeIcon type={activity.type} className="h-5 w-5" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium">{activity.name}</h4>
                {activity.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {activity.description}
                  </p>
                )}
              </div>
              <StatusPill status={activity.status} size="sm" />
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{activity.durationMinutes} min</span>
              </div>

              {activity.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">
                    {activity.location.name}
                  </span>
                </div>
              )}

              {activity.cost && (
                <div className="flex items-center gap-1">
                  <span>
                    {formatCurrency(activity.cost.amount, activity.cost.currency)}
                    {activity.costSplit === "per_person" && "/person"}
                  </span>
                </div>
              )}
            </div>

            {activity.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {activity.tags.map((tag) => (
                  <ActivityTag key={tag} tag={tag} size="sm" />
                ))}
              </div>
            )}

            {reservation && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                <span className="font-medium">🎫 {reservation.name}</span>
                {reservation.confirmationNumber && (
                  <span className="text-muted-foreground ml-2">
                    Conf: {reservation.confirmationNumber}
                  </span>
                )}
              </div>
            )}

            {activity.tips && (
              <p className="mt-2 text-xs text-muted-foreground italic">
                💡 {activity.tips}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {activity.location && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    const query = encodeURIComponent(activity.location?.address || activity.location?.name || "");
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
                  }}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Navigate
                </Button>
              )}
              {reservation?.contactPhone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => window.open(`tel:${reservation.contactPhone}`, "_self")}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
              )}
              {activity.links && activity.links.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => window.open(activity.links?.[0]?.url, "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Links
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTransit && activity.transitToNext && (
        <div className="flex items-center gap-2 py-2 pl-12 text-xs text-muted-foreground">
          <div className="h-4 border-l-2 border-dashed border-muted-foreground/30" />
          <TransportTypeIcon
            type={activity.transitToNext.mode}
            className="h-3 w-3"
          />
          <span>
            {activity.transitToNext.durationMinutes} min{" "}
            {activity.transitToNext.mode}
            {activity.transitToNext.distance && ` (${activity.transitToNext.distance})`}
          </span>
          {activity.transitToNext.cost && (
            <span>
              • {formatCurrency(
                activity.transitToNext.cost.amount,
                activity.transitToNext.cost.currency
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function ItineraryView() {
  const { days, cities } = useTripStore();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    new Set([days[0]?.id])
  );
  const [filterCity, setFilterCity] = useState<string | null>(null);

  const toggleDay = (dayId: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) {
        next.delete(dayId);
      } else {
        next.add(dayId);
      }
      return next;
    });
  };

  const filteredDays = filterCity
    ? days.filter((d) => d.cityId === filterCity)
    : days;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Day-by-Day Itinerary</h1>
          <p className="text-muted-foreground">
            {days.length} days across {cities.length} cities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filterCity === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilterCity(null)}
          >
            All
          </Button>
          {cities.map((city) => (
            <Button
              key={city.id}
              variant={filterCity === city.id ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilterCity(city.id)}
            >
              {city.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredDays.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            isExpanded={expandedDays.has(day.id)}
            onToggle={() => toggleDay(day.id)}
          />
        ))}
      </div>
    </div>
  );
}
