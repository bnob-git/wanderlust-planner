"use client";

import { useRouter } from "next/navigation";
import { useTripDataStore } from "@/store/trip-data-store";
import { useEffect } from "react";

export default function CommandCenterPage() {
  const router = useRouter();
  const trip = useTripDataStore((s) => s.trip);

  useEffect(() => {
    if (trip) {
      router.replace(`/trip/${trip.id}/command-center`);
    } else {
      router.replace("/");
    }
  }, [trip, router]);

  return null;
}
