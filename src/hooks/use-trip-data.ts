"use client";

import { useQuery } from "@tanstack/react-query";
import { useTripDataStore } from "@/store/trip-data-store";

const hasSupabase =
  typeof window !== "undefined" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function useTripQuery() {
  const trip = useTripDataStore((s) => s.trip);

  return useQuery({
    queryKey: ["trip"],
    queryFn: async () => {
      if (hasSupabase) {
        // TODO: Fetch from Supabase when env vars are configured
        // const supabase = createClient();
        // const { data } = await supabase.from("trips").select("*").single();
        // return data;
      }
      return trip;
    },
    initialData: trip,
    enabled: hasSupabase,
  });
}

export function useDaysQuery() {
  const days = useTripDataStore((s) => s.days);

  return useQuery({
    queryKey: ["days"],
    queryFn: async () => {
      if (hasSupabase) {
        // TODO: Fetch from Supabase
      }
      return days;
    },
    initialData: days,
    enabled: hasSupabase,
  });
}

export function useActivitiesQuery() {
  const activities = useTripDataStore((s) => s.activities);

  return useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      if (hasSupabase) {
        // TODO: Fetch from Supabase
      }
      return activities;
    },
    initialData: activities,
    enabled: hasSupabase,
  });
}

export function useCitiesQuery() {
  const cities = useTripDataStore((s) => s.cities);

  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      if (hasSupabase) {
        // TODO: Fetch from Supabase
      }
      return cities;
    },
    initialData: cities,
    enabled: hasSupabase,
  });
}

export function useTravelersQuery() {
  const travelers = useTripDataStore((s) => s.travelers);

  return useQuery({
    queryKey: ["travelers"],
    queryFn: async () => {
      if (hasSupabase) {
        // TODO: Fetch from Supabase
      }
      return travelers;
    },
    initialData: travelers,
    enabled: hasSupabase,
  });
}

export function useLodgingsQuery() {
  const lodgings = useTripDataStore((s) => s.lodgings);

  return useQuery({
    queryKey: ["lodgings"],
    queryFn: async () => {
      if (hasSupabase) {
        // TODO: Fetch from Supabase
      }
      return lodgings;
    },
    initialData: lodgings,
    enabled: hasSupabase,
  });
}

export function useTransportsQuery() {
  const transports = useTripDataStore((s) => s.transports);

  return useQuery({
    queryKey: ["transports"],
    queryFn: async () => {
      if (hasSupabase) {
        // TODO: Fetch from Supabase
      }
      return transports;
    },
    initialData: transports,
    enabled: hasSupabase,
  });
}

export function useBudgetItemsQuery() {
  const budgetItems = useTripDataStore((s) => s.budgetItems);

  return useQuery({
    queryKey: ["budgetItems"],
    queryFn: async () => {
      if (hasSupabase) {
        // TODO: Fetch from Supabase
      }
      return budgetItems;
    },
    initialData: budgetItems,
    enabled: hasSupabase,
  });
}

export function useActionItemsQuery() {
  const actionItems = useTripDataStore((s) => s.actionItems);

  return useQuery({
    queryKey: ["actionItems"],
    queryFn: async () => {
      if (hasSupabase) {
        // TODO: Fetch from Supabase
      }
      return actionItems;
    },
    initialData: actionItems,
    enabled: hasSupabase,
  });
}

export function usePartiesQuery() {
  const parties = useTripDataStore((s) => s.parties);

  return useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      if (hasSupabase) {
        // TODO: Fetch from Supabase
      }
      return parties;
    },
    initialData: parties,
    enabled: hasSupabase,
  });
}

export function useReservationsQuery() {
  const reservations = useTripDataStore((s) => s.reservations);

  return useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      if (hasSupabase) {
        // TODO: Fetch from Supabase
      }
      return reservations;
    },
    initialData: reservations,
    enabled: hasSupabase,
  });
}
