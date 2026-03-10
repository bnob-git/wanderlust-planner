"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTripDataStore } from "@/store/trip-data-store";
import { createClient } from "@/lib/supabase/client";
import { hasSupabase } from "@/hooks/use-trip-data";
import {
  tripToDbTrip,
  cityToDbCity,
  activityToDbActivity,
  lodgingToDbLodging,
  transportToDbTransport,
  reservationToDbReservation,
  budgetItemToDbBudgetItem,
  travelerToDbTraveler,
  partyToDbParty,
  actionItemToDbActionItem,
  dbTripToTrip,
  dbCityToCity,
  dbDayToDay,
  dbActivityToActivity,
  dbLodgingToLodging,
  dbTransportToTransport,
  dbReservationToReservation,
  dbBudgetItemToBudgetItem,
  dbTravelerToTraveler,
  dbPartyToParty,
} from "@/lib/supabase/types";
import type {
  DbTrip,
  DbCity,
  DbDay,
  DbActivity,
  DbLodging,
  DbTransport,
  DbReservation,
  DbBudgetItem,
  DbTraveler,
  DbParty,
} from "@/lib/supabase/types";
import type {
  Trip,
  City,
  Activity,
  Lodging,
  Transport,
  Reservation,
  BudgetItem,
  Traveler,
  Party,
  ActionItem,
  Day,
  BaseEntity,
} from "@/types";

type OmitBase<T extends BaseEntity> = Omit<T, keyof BaseEntity>;

function getSupabase() {
  return createClient();
}

// ============================================================================
// Trip Mutations
// ============================================================================

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const setTrip = useTripDataStore((s) => s.setTrip);

  return useMutation({
    mutationFn: async (trip: Partial<Trip>) => {
      if (!hasSupabase) {
        throw new Error("Supabase not configured");
      }
      const supabase = getSupabase();
      // Get authenticated user for RLS policy compliance
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be signed in to create a trip");
      }
      const dbData = tripToDbTrip(trip);
      (dbData as Record<string, unknown>).created_by = user.id;
      const { data, error } = await supabase
        .from("trips")
        .insert(dbData)
        .select()
        .single();
      if (error) throw error;
      const created = dbTripToTrip(data as unknown as DbTrip, [], []);
      setTrip(created);
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips-list"] });
      queryClient.invalidateQueries({ queryKey: ["trip"] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  const setTrip = useTripDataStore((s) => s.setTrip);

  return useMutation({
    mutationFn: async ({
      tripId,
      updates,
    }: {
      tripId: string;
      updates: Partial<Trip>;
    }) => {
      // Optimistic local update (always, for immediate UI feedback)
      const current = useTripDataStore.getState().trip;
      if (current) setTrip({ ...current, ...updates });
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const dbData = tripToDbTrip(updates);
      const { error } = await supabase
        .from("trips")
        .update(dbData)
        .eq("id", tripId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip"] });
      queryClient.invalidateQueries({ queryKey: ["trips-list"] });
    },
  });
}

// ============================================================================
// City Mutations
// ============================================================================

export function useCreateCity() {
  const queryClient = useQueryClient();
  const setCities = useTripDataStore((s) => s.setCities);
  const setDays = useTripDataStore((s) => s.setDays);

  return useMutation({
    onMutate: async (city: Partial<City> & { tripId: string }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["cities", city.tripId] });
      await queryClient.cancelQueries({ queryKey: ["days", city.tripId] });

      // Snapshot previous state for rollback
      const previousCities = useTripDataStore.getState().cities;
      const previousDays = useTripDataStore.getState().days;

      // Build a local City object for immediate optimistic update
      const now = new Date().toISOString();
      const cityId = crypto.randomUUID();
      const localCity: City = {
        id: cityId,
        createdAt: now,
        updatedAt: now,
        createdBy: "",
        tripId: city.tripId,
        name: city.name || "",
        country: city.country || "",
        region: city.region,
        timezone: city.timezone || "UTC",
        dateRange: city.dateRange || { start: "", end: "" },
        order: city.order ?? 0,
        location: city.location || { name: city.name || "" },
        neighborhoodIds: [],
        dayIds: [],
      };

      // Build local Day objects for the date range
      const localDays: Day[] = [];
      if (city.dateRange) {
        const start = new Date(city.dateRange.start + "T00:00:00");
        const end = new Date(city.dateRange.end + "T00:00:00");
        let dayNumber = 1;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayId = crypto.randomUUID();
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          localDays.push({
            id: dayId,
            createdAt: now,
            updatedAt: now,
            createdBy: "",
            tripId: city.tripId,
            cityId: cityId,
            dayNumber: dayNumber++,
            date: dateStr,
            dayOfWeek: d.toLocaleDateString("en-US", { weekday: "long" }),
            status: "draft",
            timeBlocks: [
              { id: `${dayId}_morning`, type: "morning", timeRange: { start: "08:00", end: "13:00" }, activityIds: [] },
              { id: `${dayId}_afternoon`, type: "afternoon", timeRange: { start: "13:00", end: "19:00" }, activityIds: [] },
              { id: `${dayId}_evening`, type: "evening", timeRange: { start: "19:00", end: "23:00" }, activityIds: [] },
            ],
            notes: [],
            budgetEstimate: { amount: 0, currency: "EUR" },
          });
        }
        localCity.dayIds = localDays.map((ld) => ld.id);
      }

      // Apply optimistic update — city appears in UI immediately
      setCities([...previousCities, localCity]);
      if (localDays.length > 0) {
        setDays([...previousDays, ...localDays]);
      }

      return { previousCities, previousDays };
    },
    mutationFn: async (city: Partial<City> & { tripId: string }) => {
      // Persist to Supabase if configured; local-only mode skips this
      if (!hasSupabase) return;

      const supabase = getSupabase();
      const dbData = cityToDbCity(city);
      const { data, error } = await supabase
        .from("cities")
        .insert(dbData)
        .select()
        .single();
      if (error) throw error;
      const created = dbCityToCity(data as unknown as DbCity, [], []);

      // Auto-generate days for the city date range in DB
      if (city.dateRange) {
        const start = new Date(city.dateRange.start + "T00:00:00");
        const end = new Date(city.dateRange.end + "T00:00:00");
        let dayNumber = 1;
        const dayInserts = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dayInserts.push({
            trip_id: city.tripId,
            city_id: created.id,
            day_number: dayNumber++,
            date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
            status: "draft",
            budget_estimate_amount: 0,
            budget_estimate_currency: "EUR",
          });
        }
        if (dayInserts.length > 0) {
          const { data: days } = await supabase
            .from("days")
            .insert(dayInserts)
            .select();
          if (days) {
            const timeBlockInserts = [];
            for (const day of days) {
              const dayTyped = day as { id: string };
              timeBlockInserts.push(
                { day_id: dayTyped.id, type: "morning", start_time: "08:00", end_time: "13:00" },
                { day_id: dayTyped.id, type: "afternoon", start_time: "13:00", end_time: "19:00" },
                { day_id: dayTyped.id, type: "evening", start_time: "19:00", end_time: "23:00" }
              );
            }
            await supabase.from("time_blocks").insert(timeBlockInserts);
          }
        }
      }
    },
    onError: (error, _variables, context) => {
      // Roll back to previous state on failure
      console.error("City creation failed:", error);
      if (context) {
        setCities(context.previousCities);
        setDays(context.previousDays);
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch fresh data from DB after mutation completes (success or error)
      if (hasSupabase) {
        queryClient.invalidateQueries({ queryKey: ["cities", variables.tripId] });
        queryClient.invalidateQueries({ queryKey: ["days", variables.tripId] });
        queryClient.invalidateQueries({ queryKey: ["trip"] });
      }
    },
  });
}

export function useUpdateCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cityId,
      updates,
      tripId,
    }: {
      cityId: string;
      updates: Partial<City>;
      tripId: string;
    }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const dbData = cityToDbCity(updates);
      const { error } = await supabase
        .from("cities")
        .update(dbData)
        .eq("id", cityId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cities", variables.tripId] });
    },
  });
}

export function useDeleteCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cityId,
      tripId,
    }: {
      cityId: string;
      tripId: string;
    }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const { error } = await supabase
        .from("cities")
        .delete()
        .eq("id", cityId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cities", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["days", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["activities", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip"] });
    },
  });
}

// ============================================================================
// Day Mutations
// ============================================================================

export function useCreateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (day: {
      tripId: string;
      cityId: string;
      dayNumber: number;
      date: string;
    }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("days")
        .insert({
          trip_id: day.tripId,
          city_id: day.cityId,
          day_number: day.dayNumber,
          date: day.date,
          status: "draft",
          budget_estimate_amount: 0,
          budget_estimate_currency: "EUR",
        })
        .select()
        .single();
      if (error) throw error;
      // Create default time blocks
      const dayTyped = data as { id: string };
      await supabase.from("time_blocks").insert([
        { day_id: dayTyped.id, type: "morning", start_time: "08:00", end_time: "13:00" },
        { day_id: dayTyped.id, type: "afternoon", start_time: "13:00", end_time: "19:00" },
        { day_id: dayTyped.id, type: "evening", start_time: "19:00", end_time: "23:00" },
      ]);
      return dbDayToDay(data as unknown as DbDay);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["days", variables.tripId] });
    },
  });
}

export function useUpdateDay() {
  const queryClient = useQueryClient();
  const updateDayStatus = useTripDataStore((s) => s.updateDayStatus);

  return useMutation({
    mutationFn: async ({
      dayId,
      updates,
      tripId,
    }: {
      dayId: string;
      updates: Partial<{ status: Day["status"]; theme: string }>;
      tripId: string;
    }) => {
      // Optimistic update
      if (updates.status) {
        updateDayStatus(dayId, updates.status);
      }
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const dbUpdates: Record<string, unknown> = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
      const { error } = await supabase
        .from("days")
        .update(dbUpdates)
        .eq("id", dayId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["days", variables.tripId] });
    },
  });
}

export function useUpdateDayStatus() {
  const queryClient = useQueryClient();
  const updateDayStatus = useTripDataStore((s) => s.updateDayStatus);

  return useMutation({
    mutationFn: async ({
      dayId,
      status,
      tripId,
    }: {
      dayId: string;
      status: Day["status"];
      tripId?: string;
    }) => {
      updateDayStatus(dayId, status);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const { error } = await supabase
        .from("days")
        .update({ status })
        .eq("id", dayId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      if (variables.tripId) {
        queryClient.invalidateQueries({ queryKey: ["days", variables.tripId] });
      }
    },
  });
}

// ============================================================================
// Activity Mutations
// ============================================================================

export function useAddActivity() {
  const queryClient = useQueryClient();
  const addActivity = useTripDataStore((s) => s.addActivity);

  return useMutation({
    mutationFn: async (activity: OmitBase<Activity>) => {
      // Optimistic local update
      addActivity(activity);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const dbData = activityToDbActivity(activity);
      const { error } = await supabase.from("activities").insert(dbData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: Partial<Activity> & { tripId: string; dayId: string; timeBlockId: string; name: string }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const dbData = activityToDbActivity(activity);
      const { data, error } = await supabase
        .from("activities")
        .insert(dbData)
        .select()
        .single();
      if (error) throw error;
      return dbActivityToActivity(data as unknown as DbActivity);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activities", variables.tripId] });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  const updateActivity = useTripDataStore((s) => s.updateActivity);

  return useMutation({
    mutationFn: async ({
      activityId,
      updates,
      tripId,
    }: {
      activityId: string;
      updates: Partial<Activity>;
      tripId?: string;
    }) => {
      updateActivity(activityId, updates);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const dbData = activityToDbActivity(updates);
      const { error } = await supabase
        .from("activities")
        .update(dbData)
        .eq("id", activityId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      if (variables.tripId) {
        queryClient.invalidateQueries({ queryKey: ["activities", variables.tripId] });
      }
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const deleteActivity = useTripDataStore((s) => s.deleteActivity);

  return useMutation({
    mutationFn: async (activityId: string) => {
      deleteActivity(activityId);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useUpdateActivityStatus() {
  const queryClient = useQueryClient();
  const updateActivityStatus = useTripDataStore((s) => s.updateActivityStatus);

  return useMutation({
    mutationFn: async ({
      activityId,
      status,
      tripId,
    }: {
      activityId: string;
      status: Activity["status"];
      tripId?: string;
    }) => {
      updateActivityStatus(activityId, status);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const { error } = await supabase
        .from("activities")
        .update({ status })
        .eq("id", activityId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      if (variables.tripId) {
        queryClient.invalidateQueries({ queryKey: ["activities", variables.tripId] });
      }
    },
  });
}

export function useReorderActivities() {
  const queryClient = useQueryClient();
  const reorderActivities = useTripDataStore((s) => s.reorderActivities);

  return useMutation({
    mutationFn: async ({
      timeBlockId,
      activityIds,
      tripId,
    }: {
      timeBlockId: string;
      activityIds: string[];
      tripId?: string;
    }) => {
      reorderActivities(timeBlockId, activityIds);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      // Batch update sort_order for each activity
      const updates = activityIds.map((id, index) =>
        supabase
          .from("activities")
          .update({ sort_order: index })
          .eq("id", id)
      );
      await Promise.all(updates);
    },
    onSuccess: (_, variables) => {
      if (variables.tripId) {
        queryClient.invalidateQueries({ queryKey: ["activities", variables.tripId] });
      }
    },
  });
}

// ============================================================================
// Lodging Mutations
// ============================================================================

export function useCreateLodging() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lodging: Partial<Lodging> & { tripId: string }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const dbData = lodgingToDbLodging(lodging);
      const { data, error } = await supabase
        .from("lodgings")
        .insert(dbData)
        .select()
        .single();
      if (error) throw error;
      return dbLodgingToLodging(data as unknown as DbLodging);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lodgings", variables.tripId] });
    },
  });
}

export function useUpdateLodging() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lodgingId,
      updates,
      tripId,
    }: {
      lodgingId: string;
      updates: Partial<Lodging>;
      tripId: string;
    }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const dbData = lodgingToDbLodging(updates);
      const { error } = await supabase
        .from("lodgings")
        .update(dbData)
        .eq("id", lodgingId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lodgings", variables.tripId] });
    },
  });
}

export function useDeleteLodging() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lodgingId,
      tripId,
    }: {
      lodgingId: string;
      tripId: string;
    }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const { error } = await supabase
        .from("lodgings")
        .delete()
        .eq("id", lodgingId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lodgings", variables.tripId] });
    },
  });
}

// ============================================================================
// Transport Mutations
// ============================================================================

export function useCreateTransport() {
  const queryClient = useQueryClient();
  const setTransports = useTripDataStore((s) => s.setTransports);

  return useMutation({
    mutationFn: async (transport: Partial<Transport> & { tripId: string }) => {
      // Optimistic local update — transport appears in UI immediately
      const now = new Date().toISOString();
      const localTransport: Transport = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        createdBy: "",
        tripId: transport.tripId,
        type: transport.type || "flight",
        carrier: transport.carrier,
        flightNumber: transport.flightNumber,
        trainNumber: transport.trainNumber,
        departure: transport.departure || { location: { name: "" }, dateTime: now },
        arrival: transport.arrival || { location: { name: "" }, dateTime: now },
        durationMinutes: transport.durationMinutes || 0,
        status: transport.status || "planned",
        confirmationNumber: transport.confirmationNumber,
        bookingReference: transport.bookingReference,
        bookingUrl: transport.bookingUrl,
        class: transport.class,
        totalCost: transport.totalCost || { amount: 0, currency: "EUR" },
        travelerIds: transport.travelerIds || [],
        notes: transport.notes,
      };
      const currentTransports = useTripDataStore.getState().transports;
      setTransports([...currentTransports, localTransport]);

      if (!hasSupabase) return;
      const supabase = getSupabase();
      const travelerIds = transport.travelerIds || [];
      const dbData = transportToDbTransport(transport);
      const { data, error } = await supabase
        .from("transports")
        .insert(dbData)
        .select()
        .single();
      if (error) throw error;
      // Insert transport_travelers
      const transportId = (data as { id: string }).id;
      if (travelerIds.length > 0) {
        const travelerInserts = travelerIds.map((tid) => ({
          transport_id: transportId,
          traveler_id: tid,
        }));
        await supabase.from("transport_travelers").insert(travelerInserts);
      }
      return dbTransportToTransport(data as unknown as DbTransport);
    },
    onSuccess: (_, variables) => {
      if (hasSupabase) {
        queryClient.invalidateQueries({ queryKey: ["transports", variables.tripId] });
      }
    },
  });
}

export function useUpdateTransport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transportId,
      updates,
      tripId,
    }: {
      transportId: string;
      updates: Partial<Transport>;
      tripId: string;
    }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const dbData = transportToDbTransport(updates);
      const { error } = await supabase
        .from("transports")
        .update(dbData)
        .eq("id", transportId);
      if (error) throw error;
      // Update transport_travelers if provided
      if (updates.travelerIds) {
        await supabase
          .from("transport_travelers")
          .delete()
          .eq("transport_id", transportId);
        if (updates.travelerIds.length > 0) {
          const travelerInserts = updates.travelerIds.map((tid) => ({
            transport_id: transportId,
            traveler_id: tid,
          }));
          await supabase.from("transport_travelers").insert(travelerInserts);
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transports", variables.tripId] });
    },
  });
}

export function useDeleteTransport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transportId,
      tripId,
    }: {
      transportId: string;
      tripId: string;
    }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const { error } = await supabase
        .from("transports")
        .delete()
        .eq("id", transportId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transports", variables.tripId] });
    },
  });
}

// ============================================================================
// Reservation Mutations
// ============================================================================

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservation: Partial<Reservation> & { tripId: string }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const dbData = reservationToDbReservation(reservation);
      const { data, error } = await supabase
        .from("reservations")
        .insert(dbData)
        .select()
        .single();
      if (error) throw error;
      return dbReservationToReservation(data as unknown as DbReservation);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reservations", variables.tripId] });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reservationId,
      updates,
      tripId,
    }: {
      reservationId: string;
      updates: Partial<Reservation>;
      tripId: string;
    }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const dbData = reservationToDbReservation(updates);
      const { error } = await supabase
        .from("reservations")
        .update(dbData)
        .eq("id", reservationId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reservations", variables.tripId] });
    },
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reservationId,
      tripId,
    }: {
      reservationId: string;
      tripId: string;
    }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", reservationId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reservations", variables.tripId] });
    },
  });
}

// ============================================================================
// Traveler Mutations
// ============================================================================

export function useCreateTraveler() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (traveler: Partial<Traveler> & { tripId: string; name: string }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const dbData = travelerToDbTraveler(traveler);
      const { data, error } = await supabase
        .from("travelers")
        .insert(dbData)
        .select()
        .single();
      if (error) throw error;
      return dbTravelerToTraveler(data as unknown as DbTraveler, "");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["travelers", variables.tripId] });
    },
  });
}

export function useAddTraveler() {
  const queryClient = useQueryClient();
  const addTraveler = useTripDataStore((s) => s.addTraveler);

  return useMutation({
    mutationFn: async (traveler: OmitBase<Traveler>) => {
      addTraveler(traveler);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const dbData = travelerToDbTraveler(traveler);
      const { error } = await supabase.from("travelers").insert(dbData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travelers"] });
    },
  });
}

export function useUpdateTraveler() {
  const queryClient = useQueryClient();
  const updateTraveler = useTripDataStore((s) => s.updateTraveler);

  return useMutation({
    mutationFn: async ({
      travelerId,
      updates,
      tripId,
    }: {
      travelerId: string;
      updates: Partial<Traveler>;
      tripId?: string;
    }) => {
      updateTraveler(travelerId, updates);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const dbData = travelerToDbTraveler(updates);
      const { error } = await supabase
        .from("travelers")
        .update(dbData)
        .eq("id", travelerId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      if (variables.tripId) {
        queryClient.invalidateQueries({ queryKey: ["travelers", variables.tripId] });
      }
    },
  });
}

// ============================================================================
// Budget Item Mutations
// ============================================================================

export function useCreateBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Partial<BudgetItem> & { tripId: string }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const dbData = budgetItemToDbBudgetItem(item);
      const { data, error } = await supabase
        .from("budget_items")
        .insert(dbData)
        .select()
        .single();
      if (error) throw error;
      return dbBudgetItemToBudgetItem(data as unknown as DbBudgetItem);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budgetItems", variables.tripId] });
    },
  });
}

export function useAddBudgetItem() {
  const queryClient = useQueryClient();
  const addBudgetItem = useTripDataStore((s) => s.addBudgetItem);

  return useMutation({
    mutationFn: async (item: OmitBase<BudgetItem>) => {
      addBudgetItem(item);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const dbData = budgetItemToDbBudgetItem(item);
      const { error } = await supabase.from("budget_items").insert(dbData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
    },
  });
}

export function useUpdateBudgetItem() {
  const queryClient = useQueryClient();
  const updateBudgetItem = useTripDataStore((s) => s.updateBudgetItem);

  return useMutation({
    mutationFn: async ({
      itemId,
      updates,
      tripId,
    }: {
      itemId: string;
      updates: Partial<BudgetItem>;
      tripId?: string;
    }) => {
      updateBudgetItem(itemId, updates);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const dbData = budgetItemToDbBudgetItem(updates);
      const { error } = await supabase
        .from("budget_items")
        .update(dbData)
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      if (variables.tripId) {
        queryClient.invalidateQueries({ queryKey: ["budgetItems", variables.tripId] });
      }
    },
  });
}

export function useDeleteBudgetItem() {
  const queryClient = useQueryClient();
  const deleteBudgetItem = useTripDataStore((s) => s.deleteBudgetItem);

  return useMutation({
    mutationFn: async (itemId: string) => {
      deleteBudgetItem(itemId);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const { error } = await supabase
        .from("budget_items")
        .delete()
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetItems"] });
    },
  });
}

// ============================================================================
// Party Mutations
// ============================================================================

export function useCreateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (party: Partial<Party> & { tripId: string; name: string }) => {
      if (!hasSupabase) throw new Error("Supabase not configured");
      const supabase = getSupabase();
      const dbData = partyToDbParty(party);
      const { data, error } = await supabase
        .from("parties")
        .insert(dbData)
        .select()
        .single();
      if (error) throw error;
      const created = dbPartyToParty(data as unknown as DbParty);
      // Insert party_travelers
      if (party.travelerIds && party.travelerIds.length > 0) {
        const travelerInserts = party.travelerIds.map((tid) => ({
          party_id: created.id,
          traveler_id: tid,
        }));
        await supabase.from("party_travelers").insert(travelerInserts);
      }
      // Insert party_cities
      if (party.cityIds && party.cityIds.length > 0) {
        const cityInserts = party.cityIds.map((cid) => ({
          party_id: created.id,
          city_id: cid,
        }));
        await supabase.from("party_cities").insert(cityInserts);
      }
      return created;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["parties", variables.tripId] });
    },
  });
}

export function useAddParty() {
  const queryClient = useQueryClient();
  const addParty = useTripDataStore((s) => s.addParty);

  return useMutation({
    mutationFn: async (party: OmitBase<Party>) => {
      addParty(party);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      const dbData = partyToDbParty(party);
      try {
        const { data, error } = await supabase
          .from("parties")
          .insert(dbData)
          .select()
          .single();
        if (error) throw error;
        const partyId = (data as { id: string }).id;
        if (party.travelerIds && party.travelerIds.length > 0) {
          await supabase.from("party_travelers").insert(
            party.travelerIds.map((tid) => ({ party_id: partyId, traveler_id: tid }))
          );
        }
        if (party.cityIds && party.cityIds.length > 0) {
          await supabase.from("party_cities").insert(
            party.cityIds.map((cid) => ({ party_id: partyId, city_id: cid }))
          );
        }
      } catch {
        // parties table may not exist yet
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useUpdateParty() {
  const queryClient = useQueryClient();
  const updateParty = useTripDataStore((s) => s.updateParty);

  return useMutation({
    mutationFn: async ({
      partyId,
      updates,
      tripId,
    }: {
      partyId: string;
      updates: Partial<Party>;
      tripId?: string;
    }) => {
      updateParty(partyId, updates);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      try {
        const dbData = partyToDbParty(updates);
        const { error } = await supabase
          .from("parties")
          .update(dbData)
          .eq("id", partyId);
        if (error) throw error;
      } catch {
        // parties table may not exist yet
      }
    },
    onSuccess: (_, variables) => {
      if (variables.tripId) {
        queryClient.invalidateQueries({ queryKey: ["parties", variables.tripId] });
      }
    },
  });
}

export function useDeleteParty() {
  const queryClient = useQueryClient();
  const deleteParty = useTripDataStore((s) => s.deleteParty);

  return useMutation({
    mutationFn: async (partyId: string) => {
      deleteParty(partyId);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      try {
        const { error } = await supabase
          .from("parties")
          .delete()
          .eq("id", partyId);
        if (error) throw error;
      } catch {
        // parties table may not exist yet
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

// ============================================================================
// Action Item Mutations
// ============================================================================

export function useAddActionItem() {
  const queryClient = useQueryClient();
  const addActionItem = useTripDataStore((s) => s.addActionItem);

  return useMutation({
    mutationFn: async (item: OmitBase<ActionItem>) => {
      addActionItem(item);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      try {
        const dbData = actionItemToDbActionItem(item);
        const tripId = (item as unknown as { tripId?: string }).tripId;
        if (tripId) (dbData as Record<string, unknown>).trip_id = tripId;
        const { error } = await supabase.from("action_items").insert(dbData);
        if (error) throw error;
      } catch {
        // action_items table may not exist yet
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionItems"] });
    },
  });
}

export function useCompleteActionItem() {
  const queryClient = useQueryClient();
  const completeActionItem = useTripDataStore((s) => s.completeActionItem);

  return useMutation({
    mutationFn: async (itemId: string) => {
      completeActionItem(itemId);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      try {
        const { error } = await supabase
          .from("action_items")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", itemId);
        if (error) throw error;
      } catch {
        // action_items table may not exist yet
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionItems"] });
    },
  });
}

export function useDeleteActionItem() {
  const queryClient = useQueryClient();
  const deleteActionItem = useTripDataStore((s) => s.deleteActionItem);

  return useMutation({
    mutationFn: async (itemId: string) => {
      deleteActionItem(itemId);
      if (!hasSupabase) return;
      const supabase = getSupabase();
      try {
        const { error } = await supabase
          .from("action_items")
          .delete()
          .eq("id", itemId);
        if (error) throw error;
      } catch {
        // action_items table may not exist yet
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionItems"] });
    },
  });
}
