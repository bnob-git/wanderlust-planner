"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateTrip } from "@/hooks/use-trip-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewTripPage() {
  const router = useRouter();
  const createTrip = useCreateTrip();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState("EUR");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;

    try {
      const result = await createTrip.mutateAsync({
        name,
        description: description || undefined,
        dateRange: { start: startDate, end: endDate },
        status: "planning",
        budget: {
          total: {
            amount: budgetAmount ? parseFloat(budgetAmount) : 0,
            currency: budgetCurrency,
          },
          byCategory: {
            lodging: { amount: 0, currency: budgetCurrency },
            flights: { amount: 0, currency: budgetCurrency },
            transport: { amount: 0, currency: budgetCurrency },
            food: { amount: 0, currency: budgetCurrency },
            activities: { amount: 0, currency: budgetCurrency },
            shopping: { amount: 0, currency: budgetCurrency },
            other: { amount: 0, currency: budgetCurrency },
          },
        },
        settings: {
          pacePreference: "balanced",
          walkingTolerance: "medium",
          budgetSensitivity: "moderate",
          interests: {
            food: 20,
            culture: 20,
            nature: 20,
            nightlife: 10,
            shopping: 10,
            relaxation: 20,
          },
          schedule: {
            typicalWakeTime: "08:00",
            typicalSleepTime: "23:00",
            breakfastPreference: "light",
            lunchDurationMinutes: 60,
            dinnerTime: "20:00",
          },
          timeBlocks: {
            morning: { start: "08:00", end: "13:00" },
            afternoon: { start: "13:00", end: "19:00" },
            evening: { start: "19:00", end: "23:00" },
          },
        },
        isPublic: false,
        travelerIds: [],
        cityIds: [],
      });

      if (result) {
        router.push(`/trip/${result.id}/command-center`);
      }
    } catch (error) {
      console.error("Failed to create trip:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Trip</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Europe Adventure"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What's this trip about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Total Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={budgetCurrency}
                  onChange={(e) => setBudgetCurrency(e.target.value)}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="CHF">CHF</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name || !startDate || !endDate || createTrip.isPending}
              >
                {createTrip.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Trip"
                )}
              </Button>
            </div>

            {(createTrip.isError || errorMessage) && (
              <p className="text-sm text-destructive">
                {errorMessage || "Failed to create trip. Please check your Supabase connection and try again."}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
