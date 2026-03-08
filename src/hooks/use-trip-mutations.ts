"use client";

import { useMutation } from "@tanstack/react-query";
import { useTripDataStore } from "@/store/trip-data-store";
import type {
  Activity,
  Party,
  BudgetItem,
  ActionItem,
  Traveler,
  Day,
  BaseEntity,
} from "@/types";

type OmitBase<T extends BaseEntity> = Omit<T, keyof BaseEntity>;

export function useAddActivity() {
  const addActivity = useTripDataStore((s) => s.addActivity);

  return useMutation({
    mutationFn: async (activity: OmitBase<Activity>) => {
      // TODO: When Supabase is configured, insert into DB here
      addActivity(activity);
    },
  });
}

export function useUpdateActivity() {
  const updateActivity = useTripDataStore((s) => s.updateActivity);

  return useMutation({
    mutationFn: async ({
      activityId,
      updates,
    }: {
      activityId: string;
      updates: Partial<Activity>;
    }) => {
      updateActivity(activityId, updates);
    },
  });
}

export function useDeleteActivity() {
  const deleteActivity = useTripDataStore((s) => s.deleteActivity);

  return useMutation({
    mutationFn: async (activityId: string) => {
      deleteActivity(activityId);
    },
  });
}

export function useUpdateActivityStatus() {
  const updateActivityStatus = useTripDataStore((s) => s.updateActivityStatus);

  return useMutation({
    mutationFn: async ({
      activityId,
      status,
    }: {
      activityId: string;
      status: Activity["status"];
    }) => {
      updateActivityStatus(activityId, status);
    },
  });
}

export function useUpdateDayStatus() {
  const updateDayStatus = useTripDataStore((s) => s.updateDayStatus);

  return useMutation({
    mutationFn: async ({
      dayId,
      status,
    }: {
      dayId: string;
      status: Day["status"];
    }) => {
      updateDayStatus(dayId, status);
    },
  });
}

export function useReorderActivities() {
  const reorderActivities = useTripDataStore((s) => s.reorderActivities);

  return useMutation({
    mutationFn: async ({
      timeBlockId,
      activityIds,
    }: {
      timeBlockId: string;
      activityIds: string[];
    }) => {
      reorderActivities(timeBlockId, activityIds);
    },
  });
}

export function useAddParty() {
  const addParty = useTripDataStore((s) => s.addParty);

  return useMutation({
    mutationFn: async (party: OmitBase<Party>) => {
      addParty(party);
    },
  });
}

export function useUpdateParty() {
  const updateParty = useTripDataStore((s) => s.updateParty);

  return useMutation({
    mutationFn: async ({
      partyId,
      updates,
    }: {
      partyId: string;
      updates: Partial<Party>;
    }) => {
      updateParty(partyId, updates);
    },
  });
}

export function useDeleteParty() {
  const deleteParty = useTripDataStore((s) => s.deleteParty);

  return useMutation({
    mutationFn: async (partyId: string) => {
      deleteParty(partyId);
    },
  });
}

export function useAddBudgetItem() {
  const addBudgetItem = useTripDataStore((s) => s.addBudgetItem);

  return useMutation({
    mutationFn: async (item: OmitBase<BudgetItem>) => {
      addBudgetItem(item);
    },
  });
}

export function useUpdateBudgetItem() {
  const updateBudgetItem = useTripDataStore((s) => s.updateBudgetItem);

  return useMutation({
    mutationFn: async ({
      itemId,
      updates,
    }: {
      itemId: string;
      updates: Partial<BudgetItem>;
    }) => {
      updateBudgetItem(itemId, updates);
    },
  });
}

export function useDeleteBudgetItem() {
  const deleteBudgetItem = useTripDataStore((s) => s.deleteBudgetItem);

  return useMutation({
    mutationFn: async (itemId: string) => {
      deleteBudgetItem(itemId);
    },
  });
}

export function useAddActionItem() {
  const addActionItem = useTripDataStore((s) => s.addActionItem);

  return useMutation({
    mutationFn: async (item: OmitBase<ActionItem>) => {
      addActionItem(item);
    },
  });
}

export function useCompleteActionItem() {
  const completeActionItem = useTripDataStore((s) => s.completeActionItem);

  return useMutation({
    mutationFn: async (itemId: string) => {
      completeActionItem(itemId);
    },
  });
}

export function useDeleteActionItem() {
  const deleteActionItem = useTripDataStore((s) => s.deleteActionItem);

  return useMutation({
    mutationFn: async (itemId: string) => {
      deleteActionItem(itemId);
    },
  });
}

export function useAddTraveler() {
  const addTraveler = useTripDataStore((s) => s.addTraveler);

  return useMutation({
    mutationFn: async (traveler: OmitBase<Traveler>) => {
      addTraveler(traveler);
    },
  });
}

export function useUpdateTraveler() {
  const updateTraveler = useTripDataStore((s) => s.updateTraveler);

  return useMutation({
    mutationFn: async ({
      travelerId,
      updates,
    }: {
      travelerId: string;
      updates: Partial<Traveler>;
    }) => {
      updateTraveler(travelerId, updates);
    },
  });
}
