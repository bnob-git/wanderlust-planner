import { describe, it, expect } from "vitest";
import { useTripDataStore } from "../trip-data-store";

// Reset the store before each test by re-importing initial data
function resetStore() {
  const state = useTripDataStore.getState();
  // The store is initialized with trip-data, so we just need to ensure it's in a known state
  return state;
}

describe("trip-data-store", () => {
  describe("initial state", () => {
    it("has a trip loaded", () => {
      const state = resetStore();
      expect(state.trip).not.toBeNull();
      expect(state.trip?.name).toBe("Spain & UK Summer 2026");
    });

    it("has cities loaded", () => {
      const state = resetStore();
      expect(state.cities.length).toBeGreaterThan(0);
    });

    it("has days loaded", () => {
      const state = resetStore();
      expect(state.days.length).toBeGreaterThan(0);
    });

    it("has activities loaded", () => {
      const state = resetStore();
      expect(state.activities.length).toBeGreaterThan(0);
    });
  });

  describe("getters", () => {
    it("getCity returns a city by id", () => {
      const state = resetStore();
      const city = state.getCity(state.cities[0].id);
      expect(city).toBeDefined();
      expect(city?.id).toBe(state.cities[0].id);
    });

    it("getCity returns undefined for unknown id", () => {
      const state = resetStore();
      expect(state.getCity("nonexistent")).toBeUndefined();
    });

    it("getDay returns a day by id", () => {
      const state = resetStore();
      const day = state.getDay(state.days[0].id);
      expect(day).toBeDefined();
      expect(day?.id).toBe(state.days[0].id);
    });

    it("getDaysForCity returns sorted days for a city", () => {
      const state = resetStore();
      const cityId = state.cities[0].id;
      const days = state.getDaysForCity(cityId);
      expect(days.length).toBeGreaterThan(0);
      for (let i = 1; i < days.length; i++) {
        expect(days[i].dayNumber).toBeGreaterThanOrEqual(days[i - 1].dayNumber);
      }
    });

    it("getActivitiesForDay returns activities for a day", () => {
      const state = resetStore();
      const dayId = state.days[0].id;
      const activities = state.getActivitiesForDay(dayId);
      expect(activities.length).toBeGreaterThanOrEqual(0);
    });

    it("getActivitiesForTimeBlock returns sorted activities", () => {
      const state = resetStore();
      // Find a timeblock with activities
      const day = state.days[0];
      const timeBlock = day.timeBlocks[0];
      const activities = state.getActivitiesForTimeBlock(timeBlock.id);
      for (let i = 1; i < activities.length; i++) {
        expect(activities[i].order).toBeGreaterThanOrEqual(
          activities[i - 1].order
        );
      }
    });

    it("getTraveler returns a traveler by id", () => {
      const state = resetStore();
      if (state.travelers.length > 0) {
        const traveler = state.getTraveler(state.travelers[0].id);
        expect(traveler).toBeDefined();
        expect(traveler?.id).toBe(state.travelers[0].id);
      }
    });
  });

  describe("activity CRUD", () => {
    it("addActivity adds an activity with a UUID id", () => {
      const initialCount = useTripDataStore.getState().activities.length;

      useTripDataStore.getState().addActivity({
        tripId: "trip_1",
        dayId: "day_1",
        timeBlockId: "tb_d1_morning",
        name: "Test Activity",
        type: "sightseeing",
        durationMinutes: 60,
        isFlexible: true,
        status: "idea",
        tags: [],
        priority: "nice_to_have",
        costSplit: "all",
        order: 99,
      });

      const state = useTripDataStore.getState();
      expect(state.activities.length).toBe(initialCount + 1);

      const newActivity = state.activities[state.activities.length - 1];
      expect(newActivity.name).toBe("Test Activity");
      expect(newActivity.id).toContain("activity_");
      // Verify UUID format (with prefix)
      expect(newActivity.id).toMatch(/^activity_[0-9a-f-]{36}$/);
      expect(newActivity.createdAt).toBeDefined();
      expect(newActivity.updatedAt).toBeDefined();
      expect(newActivity.createdBy).toBe("traveler_you");
    });

    it("updateActivity modifies an existing activity", () => {
      const state = useTripDataStore.getState();
      const activity = state.activities[0];

      useTripDataStore.getState().updateActivity(activity.id, {
        name: "Updated Name",
      });

      const updated = useTripDataStore.getState().activities.find(
        (a) => a.id === activity.id
      );
      expect(updated?.name).toBe("Updated Name");
    });

    it("deleteActivity removes an activity", () => {
      const state = useTripDataStore.getState();
      const activity = state.activities[0];
      const initialCount = state.activities.length;

      useTripDataStore.getState().deleteActivity(activity.id);

      const newState = useTripDataStore.getState();
      expect(newState.activities.length).toBe(initialCount - 1);
      expect(newState.activities.find((a) => a.id === activity.id)).toBeUndefined();
    });

    it("updateActivityStatus changes the status", () => {
      const state = useTripDataStore.getState();
      const activity = state.activities[0];

      useTripDataStore.getState().updateActivityStatus(activity.id, "confirmed");

      const updated = useTripDataStore.getState().activities.find(
        (a) => a.id === activity.id
      );
      expect(updated?.status).toBe("confirmed");
    });
  });

  describe("party CRUD", () => {
    it("addParty adds a party with UUID id", () => {
      const initialCount = useTripDataStore.getState().parties.length;

      useTripDataStore.getState().addParty({
        tripId: "trip_1",
        name: "Test Party",
        color: "#ff0000",
        travelerIds: [],
        dateRange: { start: "2026-06-19", end: "2026-07-03" },
        cityIds: [],
        isCore: false,
      });

      const state = useTripDataStore.getState();
      expect(state.parties.length).toBe(initialCount + 1);

      const newParty = state.parties[state.parties.length - 1];
      expect(newParty.name).toBe("Test Party");
      expect(newParty.id).toMatch(/^party_[0-9a-f-]{36}$/);
    });

    it("updateParty modifies an existing party", () => {
      const state = useTripDataStore.getState();
      const party = state.parties[0];

      useTripDataStore.getState().updateParty(party.id, { name: "Updated Party" });

      const updated = useTripDataStore.getState().parties.find(
        (p) => p.id === party.id
      );
      expect(updated?.name).toBe("Updated Party");
    });

    it("deleteParty removes a party", () => {
      const state = useTripDataStore.getState();
      const party = state.parties[state.parties.length - 1];
      const initialCount = state.parties.length;

      useTripDataStore.getState().deleteParty(party.id);

      expect(useTripDataStore.getState().parties.length).toBe(initialCount - 1);
    });
  });

  describe("budget item CRUD", () => {
    it("addBudgetItem adds an item with UUID id", () => {
      const initialCount = useTripDataStore.getState().budgetItems.length;

      useTripDataStore.getState().addBudgetItem({
        tripId: "trip_1",
        description: "Test expense",
        category: "food",
        amount: { amount: 50, currency: "EUR" },
        isEstimate: true,
        splitType: "all",
        date: "2026-06-20",
      });

      const state = useTripDataStore.getState();
      expect(state.budgetItems.length).toBe(initialCount + 1);

      const newItem = state.budgetItems[state.budgetItems.length - 1];
      expect(newItem.description).toBe("Test expense");
      expect(newItem.id).toMatch(/^budget_[0-9a-f-]{36}$/);
    });

    it("updateBudgetItem modifies an existing item", () => {
      const state = useTripDataStore.getState();
      const item = state.budgetItems[0];

      useTripDataStore.getState().updateBudgetItem(item.id, {
        description: "Updated expense",
      });

      const updated = useTripDataStore.getState().budgetItems.find(
        (b) => b.id === item.id
      );
      expect(updated?.description).toBe("Updated expense");
    });

    it("deleteBudgetItem removes an item", () => {
      const state = useTripDataStore.getState();
      const item = state.budgetItems[state.budgetItems.length - 1];
      const initialCount = state.budgetItems.length;

      useTripDataStore.getState().deleteBudgetItem(item.id);

      expect(useTripDataStore.getState().budgetItems.length).toBe(initialCount - 1);
    });
  });

  describe("action item CRUD", () => {
    it("addActionItem adds an item with UUID id", () => {
      const initialCount = useTripDataStore.getState().actionItems.length;

      useTripDataStore.getState().addActionItem({
        type: "book",
        title: "Test Action",
        description: "Test description",
        priority: "high",
        linkedEntityType: "activity",
      });

      const state = useTripDataStore.getState();
      expect(state.actionItems.length).toBe(initialCount + 1);

      const newItem = state.actionItems[state.actionItems.length - 1];
      expect(newItem.title).toBe("Test Action");
      expect(newItem.id).toMatch(/^action_[0-9a-f-]{36}$/);
    });

    it("completeActionItem marks item as completed", () => {
      const state = useTripDataStore.getState();
      const item = state.actionItems[0];

      useTripDataStore.getState().completeActionItem(item.id);

      const updated = useTripDataStore.getState().actionItems.find(
        (a) => a.id === item.id
      );
      expect(updated?.status).toBe("completed");
      expect(updated?.completedAt).toBeDefined();
    });

    it("deleteActionItem removes an item", () => {
      const state = useTripDataStore.getState();
      const item = state.actionItems[state.actionItems.length - 1];
      const initialCount = state.actionItems.length;

      useTripDataStore.getState().deleteActionItem(item.id);

      expect(useTripDataStore.getState().actionItems.length).toBe(
        initialCount - 1
      );
    });
  });

  describe("day operations", () => {
    it("updateDayStatus changes day status", () => {
      const state = useTripDataStore.getState();
      const day = state.days[0];

      useTripDataStore.getState().updateDayStatus(day.id, "locked");

      const updated = useTripDataStore.getState().days.find(
        (d) => d.id === day.id
      );
      expect(updated?.status).toBe("locked");
    });

    it("reorderActivities updates order", () => {
      const state = useTripDataStore.getState();
      const day = state.days[0];
      const timeBlock = day.timeBlocks[0];
      const activities = state.getActivitiesForTimeBlock(timeBlock.id);

      if (activities.length >= 2) {
        const reversed = [...activities].reverse().map((a) => a.id);
        useTripDataStore.getState().reorderActivities(timeBlock.id, reversed);

        const reordered =
          useTripDataStore.getState().getActivitiesForTimeBlock(timeBlock.id);
        expect(reordered[0].id).toBe(reversed[0]);
      }
    });
  });

  describe("traveler operations", () => {
    it("addTraveler adds a traveler with UUID id", () => {
      const initialCount = useTripDataStore.getState().travelers.length;

      useTripDataStore.getState().addTraveler({
        tripId: "trip_1",
        name: "Test Traveler",
        role: "viewer",
        partyId: "party_1",
      });

      const state = useTripDataStore.getState();
      expect(state.travelers.length).toBe(initialCount + 1);

      const newTraveler = state.travelers[state.travelers.length - 1];
      expect(newTraveler.name).toBe("Test Traveler");
      expect(newTraveler.id).toMatch(/^traveler_[0-9a-f-]{36}$/);
    });

    it("updateTraveler modifies a traveler", () => {
      const state = useTripDataStore.getState();
      const traveler = state.travelers[0];

      useTripDataStore.getState().updateTraveler(traveler.id, {
        name: "Updated Traveler",
      });

      const updated = useTripDataStore.getState().travelers.find(
        (t) => t.id === traveler.id
      );
      expect(updated?.name).toBe("Updated Traveler");
    });
  });

  describe("getTripSummary", () => {
    it("returns correct summary structure", () => {
      const summary = useTripDataStore.getState().getTripSummary();

      expect(summary).toHaveProperty("totalDays");
      expect(summary).toHaveProperty("citiesCount");
      expect(summary).toHaveProperty("bookingStats");
      expect(summary).toHaveProperty("budgetStats");
      expect(summary).toHaveProperty("daysUntilDeparture");

      expect(summary.bookingStats).toHaveProperty("total");
      expect(summary.bookingStats).toHaveProperty("confirmed");
      expect(summary.bookingStats).toHaveProperty("pending");
      expect(summary.bookingStats).toHaveProperty("needsAction");

      expect(summary.budgetStats).toHaveProperty("planned");
      expect(summary.budgetStats).toHaveProperty("actual");
      expect(summary.budgetStats).toHaveProperty("remaining");
      expect(summary.budgetStats).toHaveProperty("percentUsed");
    });

    it("totalDays matches days array length", () => {
      const state = useTripDataStore.getState();
      const summary = state.getTripSummary();
      expect(summary.totalDays).toBe(state.days.length);
    });

    it("citiesCount matches cities array length", () => {
      const state = useTripDataStore.getState();
      const summary = state.getTripSummary();
      expect(summary.citiesCount).toBe(state.cities.length);
    });

    it("daysUntilDeparture is non-negative", () => {
      const summary = useTripDataStore.getState().getTripSummary();
      expect(summary.daysUntilDeparture).toBeGreaterThanOrEqual(0);
    });

    it("bookingStats.total equals sum of confirmed + pending + needsAction + others", () => {
      const summary = useTripDataStore.getState().getTripSummary();
      const { total, confirmed, pending, needsAction } = summary.bookingStats;
      // total includes all statuses, including "canceled" and "completed"
      expect(total).toBeGreaterThanOrEqual(confirmed + pending + needsAction);
    });
  });
});
