import { describe, it, expect } from "vitest";
import {
  baseEntitySchema,
  moneySchema,
  locationSchema,
  timeRangeSchema,
  dateRangeSchema,
  bookingStatusSchema,
  dayStatusSchema,
  activityTypeSchema,
  tagSchema,
} from "../common.schema";
// tripSchema tested indirectly via entity tests
import { activitySchema } from "../activity.schema";
import { daySchema, timeBlockSchema } from "../day.schema";
import { citySchema } from "../city.schema";
import { actionItemSchema } from "../action-item.schema";
import { budgetItemSchema } from "../budget-item.schema";

// ============================================================================
// Valid test data factories
// ============================================================================

function validBaseEntity() {
  return {
    id: "test_123",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
    createdBy: "traveler_you",
  };
}

function validMoney() {
  return { amount: 100, currency: "EUR" };
}

function validLocation() {
  return {
    name: "Test Location",
    address: "123 Main St",
    latitude: 40.7128,
    longitude: -74.006,
  };
}

// ============================================================================
// Common schema tests
// ============================================================================

describe("common schemas", () => {
  describe("baseEntitySchema", () => {
    it("validates a correct base entity", () => {
      const result = baseEntitySchema.safeParse(validBaseEntity());
      expect(result.success).toBe(true);
    });

    it("rejects empty id", () => {
      const result = baseEntitySchema.safeParse({
        ...validBaseEntity(),
        id: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing createdAt", () => {
      const { createdAt: _createdAt, ...rest } = validBaseEntity();
      const result = baseEntitySchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("rejects invalid datetime format for createdAt", () => {
      const result = baseEntitySchema.safeParse({
        ...validBaseEntity(),
        createdAt: "not-a-date",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("moneySchema", () => {
    it("validates correct money", () => {
      const result = moneySchema.safeParse(validMoney());
      expect(result.success).toBe(true);
    });

    it("rejects negative amount", () => {
      const result = moneySchema.safeParse({ amount: -10, currency: "EUR" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid currency length", () => {
      const result = moneySchema.safeParse({ amount: 10, currency: "EU" });
      expect(result.success).toBe(false);
    });
  });

  describe("locationSchema", () => {
    it("validates correct location", () => {
      const result = locationSchema.safeParse(validLocation());
      expect(result.success).toBe(true);
    });

    it("validates location with only name", () => {
      const result = locationSchema.safeParse({ name: "Basic Location" });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = locationSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });

    it("rejects latitude out of range", () => {
      const result = locationSchema.safeParse({
        ...validLocation(),
        latitude: 91,
      });
      expect(result.success).toBe(false);
    });

    it("rejects longitude out of range", () => {
      const result = locationSchema.safeParse({
        ...validLocation(),
        longitude: 181,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("timeRangeSchema", () => {
    it("validates correct time range", () => {
      const result = timeRangeSchema.safeParse({ start: "08:00", end: "12:00" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid time format", () => {
      const result = timeRangeSchema.safeParse({ start: "8am", end: "12pm" });
      expect(result.success).toBe(false);
    });
  });

  describe("dateRangeSchema", () => {
    it("validates correct date range", () => {
      const result = dateRangeSchema.safeParse({
        start: "2026-06-19",
        end: "2026-07-03",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid date format", () => {
      const result = dateRangeSchema.safeParse({
        start: "June 19, 2026",
        end: "July 3, 2026",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("enum schemas", () => {
    it("bookingStatusSchema validates valid statuses", () => {
      expect(bookingStatusSchema.safeParse("idea").success).toBe(true);
      expect(bookingStatusSchema.safeParse("planned").success).toBe(true);
      expect(bookingStatusSchema.safeParse("booked").success).toBe(true);
      expect(bookingStatusSchema.safeParse("confirmed").success).toBe(true);
      expect(bookingStatusSchema.safeParse("completed").success).toBe(true);
      expect(bookingStatusSchema.safeParse("canceled").success).toBe(true);
    });

    it("bookingStatusSchema rejects invalid status", () => {
      expect(bookingStatusSchema.safeParse("unknown").success).toBe(false);
    });

    it("dayStatusSchema validates valid statuses", () => {
      expect(dayStatusSchema.safeParse("draft").success).toBe(true);
      expect(dayStatusSchema.safeParse("locked").success).toBe(true);
    });

    it("dayStatusSchema rejects invalid status", () => {
      expect(dayStatusSchema.safeParse("invalid").success).toBe(false);
    });

    it("activityTypeSchema validates valid types", () => {
      expect(activityTypeSchema.safeParse("sightseeing").success).toBe(true);
      expect(activityTypeSchema.safeParse("restaurant").success).toBe(true);
      expect(activityTypeSchema.safeParse("bar").success).toBe(true);
    });

    it("activityTypeSchema rejects invalid type", () => {
      expect(activityTypeSchema.safeParse("swimming").success).toBe(false);
    });

    it("tagSchema validates valid tags", () => {
      expect(tagSchema.safeParse("food").success).toBe(true);
      expect(tagSchema.safeParse("must_see").success).toBe(true);
      expect(tagSchema.safeParse("hidden_gem").success).toBe(true);
    });

    it("tagSchema rejects invalid tag", () => {
      expect(tagSchema.safeParse("invalid_tag").success).toBe(false);
    });
  });
});

// ============================================================================
// Entity schema tests
// ============================================================================

describe("entity schemas", () => {
  describe("activitySchema", () => {
    const validActivity = {
      ...validBaseEntity(),
      tripId: "trip_1",
      dayId: "day_1",
      timeBlockId: "tb_1",
      name: "Visit Museum",
      type: "museum",
      durationMinutes: 120,
      isFlexible: false,
      status: "planned",
      tags: ["culture", "must_see"],
      priority: "must_do",
      costSplit: "all",
      order: 0,
    };

    it("validates a correct activity", () => {
      const result = activitySchema.safeParse(validActivity);
      expect(result.success).toBe(true);
    });

    it("rejects missing name", () => {
      const { name: _name, ...rest } = validActivity;
      const result = activitySchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("rejects invalid activity type", () => {
      const result = activitySchema.safeParse({
        ...validActivity,
        type: "swimming",
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative duration", () => {
      const result = activitySchema.safeParse({
        ...validActivity,
        durationMinutes: -30,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid tags", () => {
      const result = activitySchema.safeParse({
        ...validActivity,
        tags: ["invalid_tag"],
      });
      expect(result.success).toBe(false);
    });

    it("accepts optional fields", () => {
      const result = activitySchema.safeParse({
        ...validActivity,
        description: "A lovely museum visit",
        startTime: "10:00",
        location: validLocation(),
        cost: validMoney(),
        tips: "Bring comfortable shoes",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("timeBlockSchema", () => {
    it("validates a correct time block", () => {
      const result = timeBlockSchema.safeParse({
        id: "tb_1",
        type: "morning",
        timeRange: { start: "08:00", end: "12:00" },
        activityIds: ["act_1", "act_2"],
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid type", () => {
      const result = timeBlockSchema.safeParse({
        id: "tb_1",
        type: "midnight",
        timeRange: { start: "00:00", end: "06:00" },
        activityIds: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("daySchema", () => {
    const validDay = {
      ...validBaseEntity(),
      tripId: "trip_1",
      cityId: "city_1",
      dayNumber: 1,
      date: "2026-06-19",
      dayOfWeek: "Thursday",
      status: "draft",
      timeBlocks: [
        {
          id: "tb_1",
          type: "morning",
          timeRange: { start: "08:00", end: "12:00" },
          activityIds: [],
        },
      ],
      notes: [],
      budgetEstimate: validMoney(),
    };

    it("validates a correct day", () => {
      const result = daySchema.safeParse(validDay);
      expect(result.success).toBe(true);
    });

    it("rejects invalid date format", () => {
      const result = daySchema.safeParse({
        ...validDay,
        date: "19-06-2026",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid day status", () => {
      const result = daySchema.safeParse({
        ...validDay,
        status: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects zero dayNumber", () => {
      const result = daySchema.safeParse({
        ...validDay,
        dayNumber: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("citySchema", () => {
    const validCity = {
      ...validBaseEntity(),
      tripId: "trip_1",
      name: "Málaga",
      country: "Spain",
      timezone: "Europe/Madrid",
      dateRange: { start: "2026-06-19", end: "2026-06-26" },
      order: 1,
      location: validLocation(),
      neighborhoodIds: [],
      dayIds: ["day_1", "day_2"],
    };

    it("validates a correct city", () => {
      const result = citySchema.safeParse(validCity);
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = citySchema.safeParse({
        ...validCity,
        name: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty country", () => {
      const result = citySchema.safeParse({
        ...validCity,
        country: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("actionItemSchema", () => {
    const validActionItem = {
      ...validBaseEntity(),
      type: "book",
      title: "Book flight",
      description: "Book return flight from London",
      priority: "high",
      linkedEntityType: "transport",
    };

    it("validates a correct action item", () => {
      const result = actionItemSchema.safeParse(validActionItem);
      expect(result.success).toBe(true);
    });

    it("rejects invalid type", () => {
      const result = actionItemSchema.safeParse({
        ...validActionItem,
        type: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid priority", () => {
      const result = actionItemSchema.safeParse({
        ...validActionItem,
        priority: "critical",
      });
      expect(result.success).toBe(false);
    });

    it("accepts optional status and completedAt", () => {
      const result = actionItemSchema.safeParse({
        ...validActionItem,
        status: "completed",
        completedAt: "2026-03-08T10:00:00Z",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("budgetItemSchema", () => {
    const validBudgetItem = {
      ...validBaseEntity(),
      tripId: "trip_1",
      description: "Dinner at La Boqueria",
      category: "food",
      amount: validMoney(),
      isEstimate: true,
      splitType: "all",
      date: "2026-06-20",
    };

    it("validates a correct budget item", () => {
      const result = budgetItemSchema.safeParse(validBudgetItem);
      expect(result.success).toBe(true);
    });

    it("rejects invalid category", () => {
      const result = budgetItemSchema.safeParse({
        ...validBudgetItem,
        category: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid date format", () => {
      const result = budgetItemSchema.safeParse({
        ...validBudgetItem,
        date: "20-06-2026",
      });
      expect(result.success).toBe(false);
    });
  });
});
