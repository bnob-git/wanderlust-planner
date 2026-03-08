"use client";

import { useTripId } from "@/hooks/use-trip-id";
import {
  useTripQuery,
  useDaysQuery,
  useActivitiesQuery,
  useCitiesQuery,
  useTravelersQuery,
  useLodgingsQuery,
  useTransportsQuery,
  useBudgetItemsQuery,
  useActionItemsQuery,
  usePartiesQuery,
  useReservationsQuery,
} from "@/hooks/use-trip-data";

export default function TripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tripId = useTripId();

  // Initialize all query hooks to fetch and sync trip data into Zustand store
  useTripQuery(tripId);
  useDaysQuery(tripId);
  useActivitiesQuery(tripId);
  useCitiesQuery(tripId);
  useTravelersQuery(tripId);
  useLodgingsQuery(tripId);
  useTransportsQuery(tripId);
  useBudgetItemsQuery(tripId);
  useActionItemsQuery(tripId);
  usePartiesQuery(tripId);
  useReservationsQuery(tripId);

  return <>{children}</>;
}
