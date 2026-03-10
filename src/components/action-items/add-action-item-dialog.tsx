"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAddActionItem } from "@/hooks/use-trip-mutations";
import { useTripDataStore } from "@/store/trip-data-store";
import type { ActionItem, BaseEntity } from "@/types";

type OmitBase<T extends BaseEntity> = Omit<T, keyof BaseEntity>;

interface AddActionItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const actionTypes: { value: ActionItem["type"]; label: string }[] = [
  { value: "book", label: "Book" },
  { value: "confirm", label: "Confirm" },
  { value: "upload", label: "Upload" },
  { value: "decide", label: "Decide" },
  { value: "checkin", label: "Check In" },
];

const priorities: { value: ActionItem["priority"]; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const entityTypes = [
  { value: "", label: "None" },
  { value: "lodging", label: "Lodging" },
  { value: "transport", label: "Transport" },
  { value: "reservation", label: "Reservation" },
  { value: "party", label: "Party" },
  { value: "activity", label: "Activity" },
];

export function AddActionItemDialog({ open, onOpenChange }: AddActionItemDialogProps) {
  const addActionItem = useAddActionItem();
  const { lodgings, transports, reservations, parties, activities } = useTripDataStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ActionItem["type"]>("book");
  const [priority, setPriority] = useState<ActionItem["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [linkedEntityType, setLinkedEntityType] = useState("");
  const [linkedEntityId, setLinkedEntityId] = useState("");

  const getEntityOptions = () => {
    switch (linkedEntityType) {
      case "lodging":
        return lodgings.map((l) => ({ id: l.id, name: l.name }));
      case "transport":
        return transports.map((t) => ({ id: t.id, name: t.flightNumber || t.trainNumber || t.carrier || t.id }));
      case "reservation":
        return reservations.map((r) => ({ id: r.id, name: r.name }));
      case "party":
        return parties.map((p) => ({ id: p.id, name: p.name }));
      case "activity":
        return activities.map((a) => ({ id: a.id, name: a.name }));
      default:
        return [];
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("book");
    setPriority("medium");
    setDueDate("");
    setLinkedEntityType("");
    setLinkedEntityId("");
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const item: OmitBase<ActionItem> = {
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      dueDate: dueDate || undefined,
      linkedEntityType: linkedEntityType || "",
      linkedEntityId: linkedEntityId || undefined,
      status: "pending",
    };

    addActionItem.mutate(item);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Action Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ai-title">Title</Label>
            <Input
              id="ai-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-desc">Description</Label>
            <Textarea
              id="ai-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ai-type">Type</Label>
              <select
                id="ai-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as ActionItem["type"])}
              >
                {actionTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-priority">Priority</Label>
              <select
                id="ai-priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as ActionItem["priority"])}
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-due">Due Date (optional)</Label>
            <Input
              id="ai-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ai-entity-type">Link to (optional)</Label>
              <select
                id="ai-entity-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={linkedEntityType}
                onChange={(e) => {
                  setLinkedEntityType(e.target.value);
                  setLinkedEntityId("");
                }}
              >
                {entityTypes.map((et) => (
                  <option key={et.value} value={et.value}>{et.label}</option>
                ))}
              </select>
            </div>

            {linkedEntityType && (
              <div className="space-y-2">
                <Label htmlFor="ai-entity-id">Entity</Label>
                <select
                  id="ai-entity-id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={linkedEntityId}
                  onChange={(e) => setLinkedEntityId(e.target.value)}
                >
                  <option value="">Select...</option>
                  {getEntityOptions().map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
