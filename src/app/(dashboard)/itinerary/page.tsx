"use client";

import { useRouter } from "next/navigation";
import { useTripDataStore } from "@/store/trip-data-store";
import { useEffect } from "react";

export default function ItineraryPage() {
  const router = useRouter();
  const trip = useTripDataStore((s) => s.trip);

  useEffect(() => {
    if (trip) {
      router.replace(`/trip/${trip.id}/itinerary`);
    } else {
      router.replace("/");
    }
  }, [trip, router]);

  return null;
}
