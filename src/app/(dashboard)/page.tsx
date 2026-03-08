"use client";

import { useRouter } from "next/navigation";
import { useTripsListQuery, hasSupabase } from "@/hooks/use-trip-data";
import { useTripDataStore } from "@/store/trip-data-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Calendar, Globe } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DashboardIndex() {
  const router = useRouter();
  const trip = useTripDataStore((s) => s.trip);

  // When Supabase is configured, fetch trips list
  const { data: trips, isLoading } = useTripsListQuery();

  // When Supabase is not configured, use the sample trip from store
  if (!hasSupabase) {
    if (trip) {
      router.replace(`/trip/${trip.id}/command-center`);
      return null;
    }
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">No trip data available.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Globe className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading your trips...</p>
        </div>
      </div>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <Globe className="h-16 w-16 text-primary mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Plan Your First Trip</h2>
            <p className="text-muted-foreground">
              Start planning your next adventure. Add cities, activities,
              lodging, and more to create the perfect itinerary.
            </p>
          </div>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => router.push("/new-trip")}
          >
            <Plus className="h-5 w-5" />
            Create Your First Trip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Trips</h1>
          <p className="text-muted-foreground">
            {trips.length} trip{trips.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button className="gap-2" onClick={() => router.push("/new-trip")}>
          <Plus className="h-4 w-4" />
          New Trip
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((t) => (
          <Card
            key={t.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/trip/${t.id}/command-center`)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(t.dateRange.start)} - {formatDate(t.dateRange.end)}
                </span>
              </div>
              {t.cityIds && t.cityIds.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {t.cityIds.length} {t.cityIds.length === 1 ? "city" : "cities"}
                  </span>
                </div>
              )}
              {t.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {t.description}
                </p>
              )}
              <div className="pt-1">
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary capitalize">
                  {t.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
