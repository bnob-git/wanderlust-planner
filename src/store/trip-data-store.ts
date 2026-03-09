import { create } from "zustand";
import type {
  Trip,
  Traveler,
  Party,
  City,
  Day,
  Activity,
  Lodging,
  Transport,
  Reservation,
  BudgetItem,
  ActionItem,
  BaseEntity,
} from "@/types";
import {
  trip as tripData,
  travelers as travelersData,
  parties as partiesData,
  cities as citiesData,
  days as daysData,
  activities as activitiesData,
  lodgings as lodgingsData,
  transports as transportsData,
  reservations as reservationsData,
  budgetItems as budgetItemsData,
  actionItems as actionItemsData,
} from "@/data/trip-data";

// Check if Supabase is configured - if so, start with empty state
// and let query hooks populate data. Otherwise use sample data.
const hasSupabase =
  typeof window !== "undefined" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type OmitBase<T extends BaseEntity> = Omit<T, keyof BaseEntity>;

interface TripDataStore {
  trip: Trip | null;
  travelers: Traveler[];
  parties: Party[];
  cities: City[];
  days: Day[];
  activities: Activity[];
  lodgings: Lodging[];
  transports: Transport[];
  reservations: Reservation[];
  budgetItems: BudgetItem[];
  actionItems: ActionItem[];

  // Setters for query hooks to populate the store
  setTrip: (trip: Trip) => void;
  setTravelers: (travelers: Traveler[]) => void;
  setParties: (parties: Party[]) => void;
  setCities: (cities: City[]) => void;
  setDays: (days: Day[]) => void;
  setActivities: (activities: Activity[]) => void;
  setLodgings: (lodgings: Lodging[]) => void;
  setTransports: (transports: Transport[]) => void;
  setReservations: (reservations: Reservation[]) => void;
  setBudgetItems: (budgetItems: BudgetItem[]) => void;
  setActionItems: (actionItems: ActionItem[]) => void;

  getCity: (cityId: string) => City | undefined;
  getParty: (partyId: string) => Party | undefined;
  getDay: (dayId: string) => Day | undefined;
  getDaysForCity: (cityId: string) => Day[];
  getActivitiesForDay: (dayId: string) => Activity[];
  getActivitiesForTimeBlock: (timeBlockId: string) => Activity[];
  getLodging: (lodgingId: string) => Lodging | undefined;
  getReservation: (reservationId: string) => Reservation | undefined;
  getTraveler: (travelerId: string) => Traveler | undefined;

  updateActivityStatus: (activityId: string, status: Activity["status"]) => void;
  updateDayStatus: (dayId: string, status: Day["status"]) => void;
  reorderActivities: (timeBlockId: string, activityIds: string[]) => void;

  addParty: (party: OmitBase<Party>) => void;
  updateParty: (partyId: string, updates: Partial<Party>) => void;
  deleteParty: (partyId: string) => void;

  addActivity: (activity: OmitBase<Activity>) => void;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  deleteActivity: (activityId: string) => void;

  addBudgetItem: (item: OmitBase<BudgetItem>) => void;
  updateBudgetItem: (itemId: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (itemId: string) => void;

  addActionItem: (item: OmitBase<ActionItem>) => void;
  updateActionItem: (itemId: string, updates: Partial<ActionItem>) => void;
  deleteActionItem: (itemId: string) => void;
  completeActionItem: (itemId: string) => void;

  addTraveler: (traveler: OmitBase<Traveler>) => void;
  updateTraveler: (travelerId: string, updates: Partial<Traveler>) => void;

  getTripSummary: () => {
    totalDays: number;
    citiesCount: number;
    bookingStats: {
      total: number;
      confirmed: number;
      pending: number;
      needsAction: number;
    };
    budgetStats: {
      planned: number;
      actual: number;
      remaining: number;
      percentUsed: number;
    };
    daysUntilDeparture: number;
  };
}

export const useTripDataStore = create<TripDataStore>((set, get) => ({
  trip: hasSupabase ? null : tripData,
  travelers: hasSupabase ? [] : travelersData,
  parties: hasSupabase ? [] : partiesData,
  cities: hasSupabase ? [] : citiesData,
  days: hasSupabase ? [] : daysData,
  activities: hasSupabase ? [] : activitiesData,
  lodgings: hasSupabase ? [] : lodgingsData,
  transports: hasSupabase ? [] : transportsData,
  reservations: hasSupabase ? [] : reservationsData,
  budgetItems: hasSupabase ? [] : budgetItemsData,
  actionItems: hasSupabase ? [] : actionItemsData,

  // Setters for query hooks
  setTrip: (trip) => set({ trip }),
  setTravelers: (travelers) => set({ travelers }),
  setParties: (parties) => set({ parties }),
  setCities: (cities) => set({ cities }),
  setDays: (days) => set({ days }),
  setActivities: (activities) => set({ activities }),
  setLodgings: (lodgings) => set({ lodgings }),
  setTransports: (transports) => set({ transports }),
  setReservations: (reservations) => set({ reservations }),
  setBudgetItems: (budgetItems) => set({ budgetItems }),
  setActionItems: (actionItems) => set({ actionItems }),

  getCity: (cityId) => get().cities.find((c) => c.id === cityId),
  getParty: (partyId) => get().parties.find((p) => p.id === partyId),
  getDay: (dayId) => get().days.find((d) => d.id === dayId),
  getDaysForCity: (cityId) =>
    get()
      .days.filter((d) => d.cityId === cityId)
      .sort((a, b) => a.dayNumber - b.dayNumber),
  getActivitiesForDay: (dayId) =>
    get()
      .activities.filter((a) => a.dayId === dayId)
      .sort((a, b) => a.order - b.order),
  getActivitiesForTimeBlock: (timeBlockId) =>
    get()
      .activities.filter((a) => a.timeBlockId === timeBlockId)
      .sort((a, b) => a.order - b.order),
  getLodging: (lodgingId) => get().lodgings.find((l) => l.id === lodgingId),
  getReservation: (reservationId) =>
    get().reservations.find((r) => r.id === reservationId),
  getTraveler: (travelerId) => get().travelers.find((t) => t.id === travelerId),

  updateActivityStatus: (activityId, status) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId ? { ...a, status } : a
      ),
    })),

  updateDayStatus: (dayId, status) =>
    set((state) => ({
      days: state.days.map((d) => (d.id === dayId ? { ...d, status } : d)),
    })),

  reorderActivities: (timeBlockId, activityIds) =>
    set((state) => ({
      activities: state.activities.map((a) => {
        if (a.timeBlockId === timeBlockId) {
          const newOrder = activityIds.indexOf(a.id);
          return newOrder !== -1 ? { ...a, order: newOrder } : a;
        }
        return a;
      }),
    })),

  addParty: (party) =>
    set((state) => ({
      parties: [...state.parties, { ...party, id: `party_${crypto.randomUUID()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: "traveler_you" }],
    })),

  updateParty: (partyId, updates) =>
    set((state) => ({
      parties: state.parties.map((p) =>
        p.id === partyId ? { ...p, ...updates } : p
      ),
    })),

  deleteParty: (partyId) =>
    set((state) => ({
      parties: state.parties.filter((p) => p.id !== partyId),
    })),

  addActivity: (activity) =>
    set((state) => ({
      activities: [...state.activities, { ...activity, id: `activity_${crypto.randomUUID()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: "traveler_you" }],
    })),

  updateActivity: (activityId, updates) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId ? { ...a, ...updates } : a
      ),
    })),

  deleteActivity: (activityId) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== activityId),
    })),

  addBudgetItem: (item) =>
    set((state) => ({
      budgetItems: [...state.budgetItems, { ...item, id: `budget_${crypto.randomUUID()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: "traveler_you" }],
    })),

  updateBudgetItem: (itemId, updates) =>
    set((state) => ({
      budgetItems: state.budgetItems.map((b) =>
        b.id === itemId ? { ...b, ...updates } : b
      ),
    })),

  deleteBudgetItem: (itemId) =>
    set((state) => ({
      budgetItems: state.budgetItems.filter((b) => b.id !== itemId),
    })),

  addActionItem: (item) =>
    set((state) => ({
      actionItems: [...state.actionItems, { ...item, id: `action_${crypto.randomUUID()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: "traveler_you" }],
    })),

  updateActionItem: (itemId, updates) =>
    set((state) => ({
      actionItems: state.actionItems.map((a) =>
        a.id === itemId ? { ...a, ...updates } : a
      ),
    })),

  deleteActionItem: (itemId) =>
    set((state) => ({
      actionItems: state.actionItems.filter((a) => a.id !== itemId),
    })),

  completeActionItem: (itemId) =>
    set((state) => ({
      actionItems: state.actionItems.map((a) =>
        a.id === itemId
          ? { ...a, status: "completed" as const, completedAt: new Date().toISOString() }
          : a
      ),
    })),

  addTraveler: (traveler) =>
    set((state) => ({
      travelers: [...state.travelers, { ...traveler, id: `traveler_${crypto.randomUUID()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: "traveler_you" }],
    })),

  updateTraveler: (travelerId, updates) =>
    set((state) => ({
      travelers: state.travelers.map((t) =>
        t.id === travelerId ? { ...t, ...updates } : t
      ),
    })),

  getTripSummary: () => {
    const state = get();
    const { trip, activities, budgetItems, transports, reservations, lodgings } = state;

    if (!trip) {
      return {
        totalDays: 0,
        citiesCount: 0,
        bookingStats: { total: 0, confirmed: 0, pending: 0, needsAction: 0 },
        budgetStats: { planned: 0, actual: 0, remaining: 0, percentUsed: 0 },
        daysUntilDeparture: 0,
      };
    }

    const allBookables = [
      ...activities.map((a) => a.status),
      ...transports.map((t) => t.status),
      ...reservations.map((r) => r.status),
      ...lodgings.map((l) => l.status),
    ];

    const confirmed = allBookables.filter(
      (s) => s === "confirmed" || s === "completed"
    ).length;
    const pending = allBookables.filter(
      (s) => s === "booked" || s === "planned"
    ).length;
    const needsAction = allBookables.filter((s) => s === "idea").length;

    const planned = trip.budget.total.amount;
    const actual = budgetItems
      .filter((b) => !b.isEstimate)
      .reduce((sum, b) => sum + b.amount.amount, 0);

    const startDate = new Date(trip.dateRange.start);
    const today = new Date();
    const daysUntilDeparture = Math.ceil(
      (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      totalDays: state.days.length,
      citiesCount: state.cities.length,
      bookingStats: {
        total: allBookables.length,
        confirmed,
        pending,
        needsAction,
      },
      budgetStats: {
        planned,
        actual,
        remaining: planned - actual,
        percentUsed: planned > 0 ? Math.round((actual / planned) * 100) : 0,
      },
      daysUntilDeparture: Math.max(0, daysUntilDeparture),
    };
  },
}));
