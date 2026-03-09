"use client";

import { useState } from "react";
import { useTripDataStore } from "@/store/trip-data-store";
import { useTripId } from "@/hooks/use-trip-id";
import { useUpdateTrip } from "@/hooks/use-trip-mutations";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { StatusPill } from "@/components/status-pill";
import { formatCurrency, formatDate, calculateDaysBetween } from "@/lib/utils";
import {
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Wallet,
  Clock,
  ChevronRight,
  Plane,
  Train,
  Hotel,
  Pencil,
} from "lucide-react";

export function CommandCenter() {
  const {
    trip,
    cities,
    transports,
    lodgings,
    actionItems,
    getTripSummary,
    completeActionItem,
  } = useTripDataStore();
  const router = useRouter();
  const tripId = useTripId();
  const updateTrip = useUpdateTrip();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editBudgetAmount, setEditBudgetAmount] = useState("");
  const [editBudgetCurrency, setEditBudgetCurrency] = useState("EUR");

  const summary = getTripSummary();

  const openEditDialog = () => {
    if (!trip) return;
    setEditName(trip.name);
    setEditDescription(trip.description || "");
    setEditStartDate(trip.dateRange.start);
    setEditEndDate(trip.dateRange.end);
    setEditBudgetAmount(String(trip.budget.total.amount || ""));
    setEditBudgetCurrency(trip.budget.total.currency);
    setIsEditOpen(true);
  };

  const handleEditTrip = () => {
    if (!trip) return;
    updateTrip.mutate({
      tripId: trip.id,
      updates: {
        name: editName,
        description: editDescription || undefined,
        dateRange: { start: editStartDate, end: editEndDate },
        budget: {
          ...trip.budget,
          total: {
            amount: parseFloat(editBudgetAmount) || 0,
            currency: editBudgetCurrency,
          },
        },
      },
    });
    setIsEditOpen(false);
  };

  const tripBase = tripId ? `/trip/${tripId}` : "";

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No trip loaded</p>
      </div>
    );
  }

  const pendingItems = actionItems.filter((a) => a.status !== "completed");
  const highPriorityActions = pendingItems.filter((a) => a.priority === "high");
  const otherActions = pendingItems.filter((a) => a.priority !== "high");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{trip.name}</h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(trip.dateRange.start, {
              month: "long",
              day: "numeric",
            })}{" "}
            -{" "}
            {formatDate(trip.dateRange.end, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            • {summary.totalDays} days • {trip.travelerIds.length} travelers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-1" onClick={openEditDialog}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Days until departure</p>
          <p className="text-4xl font-bold text-primary">
            {summary.daysUntilDeparture}
          </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`${tripBase}/timeline`)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cities</p>
                <p className="text-3xl font-bold">{summary.citiesCount}</p>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`${tripBase}/itinerary`)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bookings</p>
                <p className="text-3xl font-bold">
                  {summary.bookingStats.confirmed}/{summary.bookingStats.total}
                </p>
                <p className="text-xs text-muted-foreground">confirmed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`${tripBase}/budget`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(
                    summary.budgetStats.actual,
                    trip.budget.total.currency
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {formatCurrency(summary.budgetStats.planned, trip.budget.total.currency)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => {
            const el = document.getElementById("action-items-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Action Items</p>
                <p className="text-3xl font-bold">{pendingItems.length}</p>
                <p className="text-xs text-red-500">
                  {highPriorityActions.length} urgent
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            City Phases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cities.map((city, index) => {
              const days = calculateDaysBetween(
                city.dateRange.start,
                city.dateRange.end
              );
              const totalDays = calculateDaysBetween(
                trip.dateRange.start,
                trip.dateRange.end
              );
              const widthPercent = (days / totalDays) * 100;

              const colors = [
                "bg-blue-500",
                "bg-purple-500",
                "bg-orange-500",
                "bg-green-500",
                "bg-pink-500",
              ];

              return (
                <div key={city.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{city.name}</span>
                    <span className="text-muted-foreground">
                      {formatDate(city.dateRange.start, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {formatDate(city.dateRange.end, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[index % colors.length]} rounded-full`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div id="action-items-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Action Required
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {pendingItems.length} items
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {highPriorityActions.length > 0 && (
              <div className="space-y-2">
                {highPriorityActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900"
                  >
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {action.description}
                      </p>
                      {action.dueDate && (
                        <p className="text-xs text-red-600 mt-1">
                          Due: {formatDate(action.dueDate)}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeActionItem(action.id)}
                    >
                      Done
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {otherActions.slice(0, 3).map((action) => (
              <div
                key={action.id}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {action.description}
                  </p>
                </div>
              </div>
            ))}

            {pendingItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pending actions
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Key Logistics
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`${tripBase}/logistics`)}
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {transports.slice(0, 2).map((transport) => (
              <div
                key={transport.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                {transport.type === "flight" ? (
                  <Plane className="h-5 w-5 text-blue-500" />
                ) : (
                  <Train className="h-5 w-5 text-green-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {transport.flightNumber || transport.trainNumber} •{" "}
                    {transport.departure.location.name.split(" ")[0]} →{" "}
                    {transport.arrival.location.name.split(" ")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transport.departure.dateTime)}
                  </p>
                </div>
                <StatusPill status={transport.status} size="sm" />
              </div>
            ))}

            {lodgings.slice(0, 2).map((lodging) => (
              <div
                key={lodging.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <Hotel className="h-5 w-5 text-purple-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{lodging.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(lodging.checkIn.date)} -{" "}
                    {formatDate(lodging.checkOut.date)} • {lodging.nightCount}{" "}
                    nights
                  </p>
                </div>
                <StatusPill status={lodging.status} size="sm" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Budget Overview
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
                          onClick={() => router.push(`${tripBase}/budget`)}
                        >
                          Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>
                {formatCurrency(summary.budgetStats.actual, trip.budget.total.currency)}{" "}
                spent
              </span>
              <span>
                {formatCurrency(summary.budgetStats.remaining, trip.budget.total.currency)}{" "}
                remaining
              </span>
            </div>
            <Progress value={summary.budgetStats.percentUsed} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {Object.entries(trip.budget.byCategory)
                .slice(0, 4)
                .map(([category, budget]) => (
                  <div key={category} className="text-center">
                    <p className="text-xs text-muted-foreground capitalize">
                      {category}
                    </p>
                    <p className="font-medium">
                      {formatCurrency(budget.amount, budget.currency)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Edit Trip Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trip Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tripName">Trip Name</Label>
              <Input
                id="tripName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tripDesc">Description</Label>
              <Textarea
                id="tripDesc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tripStart">Start Date</Label>
                <Input
                  id="tripStart"
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tripEnd">End Date</Label>
                <Input
                  id="tripEnd"
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  min={editStartDate}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tripBudget">Total Budget</Label>
                <Input
                  id="tripBudget"
                  type="number"
                  value={editBudgetAmount}
                  onChange={(e) => setEditBudgetAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tripCurrency">Currency</Label>
                <select
                  id="tripCurrency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editBudgetCurrency}
                  onChange={(e) => setEditBudgetCurrency(e.target.value)}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTrip}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
