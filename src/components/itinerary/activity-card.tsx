"use client";

import { useState } from "react";
import { useTripDataStore } from "@/store/trip-data-store";
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
import { formatTime, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Activity, ActivityType, BookingStatus } from "@/types";
import {
  Clock,
  MapPin,
  Navigation,
  Phone,
  ExternalLink,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const statusFlow: BookingStatus[] = ["idea", "planned", "booked", "confirmed"];

const activityTypeStyles: Record<string, string> = {
  bar: "border-l-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10",
  nightclub: "border-l-purple-400 bg-purple-50/30 dark:bg-purple-950/10",
  transport: "border-dashed border-l-muted-foreground/40 bg-muted/30",
  transit: "border-dashed border-l-muted-foreground/40 bg-muted/30",
  rest: "border-l-transparent opacity-75",
  free_time: "border-l-transparent opacity-75",
};

interface ActivityCardProps {
  activity: Activity;
  showTransit: boolean;
  isLocked: boolean;
  isCompact?: boolean;
}

export function ActivityCard({
  activity,
  showTransit,
  isLocked,
  isCompact = false,
}: ActivityCardProps) {
  const {
    getReservation,
    updateActivity,
    deleteActivity,
    updateActivityStatus,
  } = useTripDataStore();
  const reservation = activity.reservationId
    ? getReservation(activity.reservationId)
    : undefined;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editName, setEditName] = useState(activity.name);
  const [editType, setEditType] = useState<ActivityType>(activity.type);
  const [editDuration, setEditDuration] = useState(
    String(activity.durationMinutes)
  );
  const [editDescription, setEditDescription] = useState(
    activity.description || ""
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: activity.id,
    disabled: isLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) return;
    const currentIndex = statusFlow.indexOf(activity.status);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return;
    updateActivityStatus(activity.id, statusFlow[currentIndex + 1]);
  };

  const handleEdit = () => {
    updateActivity(activity.id, {
      name: editName,
      type: editType,
      durationMinutes: parseInt(editDuration) || 60,
      description: editDescription || undefined,
    });
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    deleteActivity(activity.id);
    setIsDeleteOpen(false);
  };

  const typeStyle = activityTypeStyles[activity.type] || "";

  if (isCompact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-3 px-3 py-1.5 rounded border-l-2 bg-card hover:bg-muted/50 transition-colors text-sm",
          typeStyle,
          isDragging && "opacity-50 shadow-lg",
          activity.status === "canceled" && "opacity-50 line-through"
        )}
      >
        {!isLocked && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab opacity-0 group-hover:opacity-100"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
        {activity.startTime && (
          <span className="text-muted-foreground w-16 shrink-0">
            {formatTime(activity.startTime)}
          </span>
        )}
        <ActivityTypeIcon type={activity.type} className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate font-medium">{activity.name}</span>
        <span className="text-muted-foreground shrink-0">
          {activity.durationMinutes}m
        </span>
        <div onClick={handleStatusToggle} className={cn(!isLocked && "cursor-pointer")}>
          <StatusPill status={activity.status} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "group flex gap-3 p-3 rounded-lg border border-l-4 bg-card hover:shadow-sm transition-all",
          typeStyle,
          activity.status === "confirmed" && "border-green-200",
          activity.status === "canceled" && "opacity-50 line-through",
          isDragging && "opacity-50 shadow-lg"
        )}
      >
        {!isLocked && (
          <div
            {...attributes}
            {...listeners}
            className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
          >
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
              <div
                onClick={handleStatusToggle}
                className={cn(!isLocked && "cursor-pointer")}
              >
                <StatusPill status={activity.status} size="sm" />
              </div>
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
                    {formatCurrency(
                      activity.cost.amount,
                      activity.cost.currency
                    )}
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
                <span className="font-medium">
                  {reservation.name}
                </span>
                {reservation.confirmationNumber && (
                  <span className="text-muted-foreground ml-2">
                    Conf: {reservation.confirmationNumber}
                  </span>
                )}
              </div>
            )}

            {activity.tips && (
              <p className="mt-2 text-xs text-muted-foreground italic">
                {activity.tips}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isLocked && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </>
              )}
              {activity.location && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    const query = encodeURIComponent(
                      activity.location?.address ||
                        activity.location?.name ||
                        ""
                    );
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${query}`,
                      "_blank"
                    );
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
                  onClick={() =>
                    window.open(`tel:${reservation.contactPhone}`, "_self")
                  }
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
                  onClick={() =>
                    window.open(activity.links?.[0]?.url, "_blank")
                  }
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
            {activity.transitToNext.distance &&
              ` (${activity.transitToNext.distance})`}
          </span>
          {activity.transitToNext.cost && (
            <span>
              •{" "}
              {formatCurrency(
                activity.transitToNext.cost.amount,
                activity.transitToNext.cost.currency
              )}
            </span>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsEditOpen(false)} />
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Activity Name</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editType">Type</Label>
                <Select
                  id="editType"
                  value={editType}
                  onChange={(e) =>
                    setEditType(e.target.value as ActivityType)
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
                <Label htmlFor="editDuration">Duration (minutes)</Label>
                <Input
                  id="editDuration"
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDesc">Description</Label>
              <Textarea
                id="editDesc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsDeleteOpen(false)} />
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{activity.name}&quot;? This
            action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
