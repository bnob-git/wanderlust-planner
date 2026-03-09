"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTripDataStore } from "@/store/trip-data-store";
import { createClient } from "@/lib/supabase/client";
import {
  dbTripToTrip,
  dbTravelerToTraveler,
  dbCityToCity,
  dbDayToDay,
  dbActivityToActivity,
  dbLodgingToLodging,
  dbTransportToTransport,
  dbReservationToReservation,
  dbBudgetItemToBudgetItem,
  dbPartyToParty,
  dbActionItemToActionItem,
} from "@/lib/supabase/types";
import type {
  DbTrip,
  DbTraveler,
  DbCity,
  DbDay,
  DbActivity,
  DbLodging,
  DbTransport,
  DbReservation,
  DbBudgetItem,
  DbParty,
  DbActionItem,
} from "@/lib/supabase/types";

export const hasSupabase =
  typeof window !== "undefined" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabase() {
  return createClient();
}

export function useTripQuery(tripId?: string) {
  const storeTrip = useTripDataStore((s) => s.trip);
  const setTrip = useTripDataStore((s) => s.setTrip);

  const query = useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const supabase = getSupabase();
      let tripQuery = supabase.from("trips").select("*");
      if (tripId) {
        tripQuery = tripQuery.eq("id", tripId);
      }
      const { data: tripRow, error } = await tripQuery.limit(1).single();
      if (error) throw error;
      if (!tripRow) return null;

      const dbTrip = tripRow as unknown as DbTrip;
      const { data: travelerRows } = await supabase
        .from("travelers").select("id").eq("trip_id", dbTrip.id);
      const travelerIds = (travelerRows || []).map((t: { id: string }) => t.id);
      const { data: cityRows } = await supabase
        .from("cities").select("id").eq("trip_id", dbTrip.id).order("sort_order");
      const cityIds = (cityRows || []).map((c: { id: string }) => c.id);

      return dbTripToTrip(dbTrip, travelerIds, cityIds);
    },
    enabled: hasSupabase,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) { setTrip(query.data); }
  }, [query.data, setTrip]);

  return { ...query, data: query.data ?? storeTrip };
}

export function useDaysQuery(tripId?: string) {
  const storeDays = useTripDataStore((s) => s.days);
  const setDays = useTripDataStore((s) => s.setDays);

  const query = useQuery({
    queryKey: ["days", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("days").select("*, time_blocks(*)").eq("trip_id", tripId).order("day_number");
      if (error) throw error;
      return (data || []).map((row: unknown) => dbDayToDay(row as DbDay));
    },
    enabled: hasSupabase && !!tripId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) { setDays(query.data); }
  }, [query.data, setDays]);

  return { ...query, data: query.data ?? storeDays };
}

export function useActivitiesQuery(tripId?: string) {
  const storeActivities = useTripDataStore((s) => s.activities);
  const setActivities = useTripDataStore((s) => s.setActivities);

  const query = useQuery({
    queryKey: ["activities", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("activities").select("*").eq("trip_id", tripId).order("sort_order");
      if (error) throw error;
      return (data || []).map((row: unknown) => dbActivityToActivity(row as DbActivity));
    },
    enabled: hasSupabase && !!tripId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) { setActivities(query.data); }
  }, [query.data, setActivities]);

  return { ...query, data: query.data ?? storeActivities };
}

export function useCitiesQuery(tripId?: string) {
  const storeCities = useTripDataStore((s) => s.cities);
  const setCities = useTripDataStore((s) => s.setCities);

  const query = useQuery({
    queryKey: ["cities", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("cities").select("*").eq("trip_id", tripId).order("sort_order");
      if (error) throw error;

      const cities = await Promise.all(
        (data || []).map(async (row: unknown) => {
          const dbCity = row as DbCity;
          const { data: dayRows } = await supabase
            .from("days").select("id").eq("city_id", dbCity.id).order("day_number");
          const dayIds = (dayRows || []).map((d: { id: string }) => d.id);
          const { data: neighborhoodRows } = await supabase
            .from("neighborhoods").select("id").eq("city_id", dbCity.id);
          const neighborhoodIds = (neighborhoodRows || []).map((n: { id: string }) => n.id);
          return dbCityToCity(dbCity, dayIds, neighborhoodIds);
        })
      );
      return cities;
    },
    enabled: hasSupabase && !!tripId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) { setCities(query.data); }
  }, [query.data, setCities]);

  return { ...query, data: query.data ?? storeCities };
}

export function useTravelersQuery(tripId?: string) {
  const storeTravelers = useTripDataStore((s) => s.travelers);
  const setTravelers = useTripDataStore((s) => s.setTravelers);

  const query = useQuery({
    queryKey: ["travelers", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("travelers").select("*").eq("trip_id", tripId);
      if (error) throw error;

      const partyMemberships: Record<string, string> = {};
      try {
        const { data: partyRows } = await supabase
          .from("parties").select("id").eq("trip_id", tripId);
        const partyIds = (partyRows || []).map((p: { id: string }) => p.id);
        if (partyIds.length > 0) {
          const { data: partyTravelers } = await supabase
            .from("party_travelers").select("party_id, traveler_id")
            .in("party_id", partyIds);
          if (partyTravelers) {
            for (const pt of partyTravelers) {
              const ptTyped = pt as { party_id: string; traveler_id: string };
              partyMemberships[ptTyped.traveler_id] = ptTyped.party_id;
            }
          }
        }
      } catch {
        // party_travelers/parties tables may not exist yet
      }

      return (data || []).map((row: unknown) => {
        const dbTraveler = row as DbTraveler;
        const partyId = partyMemberships[dbTraveler.id] || "";
        return dbTravelerToTraveler(dbTraveler, partyId);
      });
    },
    enabled: hasSupabase && !!tripId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) { setTravelers(query.data); }
  }, [query.data, setTravelers]);

  return { ...query, data: query.data ?? storeTravelers };
}

export function useLodgingsQuery(tripId?: string) {
  const storeLodgings = useTripDataStore((s) => s.lodgings);
  const setLodgings = useTripDataStore((s) => s.setLodgings);

  const query = useQuery({
    queryKey: ["lodgings", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("lodgings").select("*").eq("trip_id", tripId);
      if (error) throw error;
      return (data || []).map((row: unknown) => dbLodgingToLodging(row as DbLodging));
    },
    enabled: hasSupabase && !!tripId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) { setLodgings(query.data); }
  }, [query.data, setLodgings]);

  return { ...query, data: query.data ?? storeLodgings };
}

export function useTransportsQuery(tripId?: string) {
  const storeTransports = useTripDataStore((s) => s.transports);
  const setTransports = useTripDataStore((s) => s.setTransports);

  const query = useQuery({
    queryKey: ["transports", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("transports").select("*, transport_travelers(traveler_id)")
        .eq("trip_id", tripId).order("departure_datetime");
      if (error) throw error;
      return (data || []).map((row: unknown) => dbTransportToTransport(row as DbTransport));
    },
    enabled: hasSupabase && !!tripId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) { setTransports(query.data); }
  }, [query.data, setTransports]);

  return { ...query, data: query.data ?? storeTransports };
}

export function useBudgetItemsQuery(tripId?: string) {
  const storeBudgetItems = useTripDataStore((s) => s.budgetItems);
  const setBudgetItems = useTripDataStore((s) => s.setBudgetItems);

  const query = useQuery({
    queryKey: ["budgetItems", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("budget_items").select("*").eq("trip_id", tripId).order("date", { ascending: false });
      if (error) throw error;
      return (data || []).map((row: unknown) => dbBudgetItemToBudgetItem(row as DbBudgetItem));
    },
    enabled: hasSupabase && !!tripId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) { setBudgetItems(query.data); }
  }, [query.data, setBudgetItems]);

  return { ...query, data: query.data ?? storeBudgetItems };
}

export function useActionItemsQuery(tripId?: string) {
  const storeActionItems = useTripDataStore((s) => s.actionItems);
  const setActionItems = useTripDataStore((s) => s.setActionItems);

  const query = useQuery({
    queryKey: ["actionItems", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const supabase = getSupabase();
      try {
        const { data, error } = await supabase
          .from("action_items").select("*").eq("trip_id", tripId).order("priority");
        if (error) throw error;
        return (data || []).map((row: unknown) => dbActionItemToActionItem(row as DbActionItem));
      } catch {
        return [];
      }
    },
    enabled: hasSupabase && !!tripId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) { setActionItems(query.data); }
  }, [query.data, setActionItems]);

  return { ...query, data: query.data ?? storeActionItems };
}

export function usePartiesQuery(tripId?: string) {
  const storeParties = useTripDataStore((s) => s.parties);
  const setParties = useTripDataStore((s) => s.setParties);

  const query = useQuery({
    queryKey: ["parties", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const supabase = getSupabase();
      try {
        const { data, error } = await supabase
          .from("parties").select("*, party_travelers(traveler_id), party_cities(city_id)")
          .eq("trip_id", tripId);
        if (error) throw error;
        return (data || []).map((row: unknown) => dbPartyToParty(row as DbParty));
      } catch {
        return [];
      }
    },
    enabled: hasSupabase && !!tripId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) { setParties(query.data); }
  }, [query.data, setParties]);

  return { ...query, data: query.data ?? storeParties };
}

export function useReservationsQuery(tripId?: string) {
  const storeReservations = useTripDataStore((s) => s.reservations);
  const setReservations = useTripDataStore((s) => s.setReservations);

  const query = useQuery({
    queryKey: ["reservations", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("reservations").select("*").eq("trip_id", tripId).order("datetime");
      if (error) throw error;
      return (data || []).map((row: unknown) => dbReservationToReservation(row as DbReservation));
    },
    enabled: hasSupabase && !!tripId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) { setReservations(query.data); }
  }, [query.data, setReservations]);

  return { ...query, data: query.data ?? storeReservations };
}

export function useTripsListQuery() {
  return useQuery({
    queryKey: ["trips-list"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase
        .from("trips").select("*").order("start_date", { ascending: false });
      if (user) {
        // Filter to user's own trips. RLS should also enforce this,
        // but explicit filtering provides defense-in-depth.
        query = query.or(`created_by.eq.${user.id},is_public.eq.true`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((row: unknown) => {
        const dbTrip = row as DbTrip;
        return dbTripToTrip(dbTrip, [], []);
      });
    },
    enabled: hasSupabase,
    staleTime: 30000,
  });
}
