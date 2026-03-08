"use client";

import { useState } from "react";
import { useTripDataStore } from "@/store/trip-data-store";
import { Button } from "@/components/ui/button";
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
import { ActivityCard } from "./activity-card";
import type { TimeBlock, ActivityType } from "@/types";
import { Plus, Sun, Sunset, Moon, Coffee } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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

const timeBlockEmptyIcons = {
  morning: Coffee,
  afternoon: Sun,
  evening: Sunset,
  night: Moon,
};

interface TimeBlockSectionProps {
  timeBlock: TimeBlock;
  dayId: string;
  isLocked: boolean;
  isCompact?: boolean;
}

export function TimeBlockSection({
  timeBlock,
  dayId,
  isLocked,
  isCompact = false,
}: TimeBlockSectionProps) {
  const { getActivitiesForTimeBlock, addActivity, reorderActivities, trip } =
    useTripDataStore();
  const activities = getActivitiesForTimeBlock(timeBlock.id);
  const Icon = timeBlockIcons[timeBlock.type];
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityType, setNewActivityType] =
    useState<ActivityType>("sightseeing");
  const [newActivityDuration, setNewActivityDuration] = useState("60");
  const [newActivityDescription, setNewActivityDescription] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activities.findIndex((a) => a.id === active.id);
    const newIndex = activities.findIndex((a) => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...activities];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);
    reorderActivities(
      timeBlock.id,
      newOrder.map((a) => a.id)
    );
  };

  const EmptyIcon = timeBlockEmptyIcons[timeBlock.type];

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
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setIsAddActivityOpen(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
          <EmptyIcon className="h-5 w-5" />
          <span>Plan your {timeBlockLabels[timeBlock.type].toLowerCase()}</span>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activities.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {activities.map((activity, index) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  showTransit={index < activities.length - 1}
                  isLocked={isLocked}
                  isCompact={isCompact}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
                  onChange={(e) =>
                    setNewActivityType(e.target.value as ActivityType)
                  }
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
            <Button
              variant="outline"
              onClick={() => setIsAddActivityOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddActivity}>Add Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
