"use client";

import { useState, useMemo } from "react";
import { useTripDataStore } from "@/store/trip-data-store";
import { useCompleteActionItem, useDeleteActionItem } from "@/hooks/use-trip-mutations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddActionItemDialog } from "@/components/action-items/add-action-item-dialog";
import { formatDate } from "@/lib/utils";
import type { ActionItem } from "@/types";
import {
  Plus,
  CheckCircle,
  Circle,
  Clock,
  Trash2,
  ListTodo,
  Filter,
} from "lucide-react";

type StatusFilter = "all" | "pending" | "completed";
type PriorityFilter = "all" | "high" | "medium" | "low";
type TypeFilter = "all" | ActionItem["type"];

export function TaskList() {
  const { actionItems } = useTripDataStore();
  const completeActionItem = useCompleteActionItem();
  const deleteActionItem = useDeleteActionItem();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filteredItems = useMemo(() => {
    return actionItems.filter((item) => {
      if (statusFilter === "pending" && item.status === "completed") return false;
      if (statusFilter === "completed" && item.status !== "completed") return false;
      if (priorityFilter !== "all" && item.priority !== priorityFilter) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      return true;
    });
  }, [actionItems, statusFilter, priorityFilter, typeFilter]);

  const pendingCount = actionItems.filter((a) => a.status !== "completed").length;
  const completedCount = actionItems.filter((a) => a.status === "completed").length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-muted-foreground";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "book": return "Book";
      case "confirm": return "Confirm";
      case "upload": return "Upload";
      case "decide": return "Decide";
      case "checkin": return "Check In";
      default: return type;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ListTodo className="h-6 w-6" />
            Tasks
          </h1>
          <p className="text-muted-foreground">
            {pendingCount} pending, {completedCount} completed
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              >
                <option value="all">All Types</option>
                <option value="book">Book</option>
                <option value="confirm">Confirm</option>
                <option value="upload">Upload</option>
                <option value="decide">Decide</option>
                <option value="checkin">Check In</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Items */}
      <div className="space-y-2">
        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {actionItems.length === 0
                  ? "No tasks yet. Add your first task to get started!"
                  : "No tasks match your current filters."}
              </p>
            </CardContent>
          </Card>
        )}

        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className={item.status === "completed" ? "opacity-60" : ""}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => {
                    if (item.status !== "completed") {
                      completeActionItem.mutate(item.id);
                    }
                  }}
                  className="mt-0.5 flex-shrink-0"
                  disabled={item.status === "completed"}
                >
                  {item.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium text-sm ${item.status === "completed" ? "line-through" : ""}`}>
                      {item.title}
                    </p>
                    <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {item.dueDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due: {formatDate(item.dueDate)}
                      </span>
                    )}
                    {item.linkedEntityType && (
                      <span className="text-xs text-muted-foreground">
                        Linked: {item.linkedEntityType}
                      </span>
                    )}
                    {item.completedAt && (
                      <span className="text-xs text-green-600">
                        Completed {formatDate(item.completedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteActionItem.mutate(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddActionItemDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}
