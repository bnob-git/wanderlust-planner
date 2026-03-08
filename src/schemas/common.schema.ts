import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const bookingStatusSchema = z.enum([
  "idea",
  "planned",
  "booked",
  "confirmed",
  "completed",
  "canceled",
]);

export const dayStatusSchema = z.enum([
  "draft",
  "planned",
  "locked",
  "active",
  "completed",
]);

export const timeBlockTypeSchema = z.enum([
  "morning",
  "afternoon",
  "evening",
  "night",
]);

export const activityTypeSchema = z.enum([
  "sightseeing",
  "museum",
  "restaurant",
  "cafe",
  "bar",
  "nightclub",
  "shopping",
  "beach",
  "park",
  "tour",
  "show",
  "transport",
  "transit",
  "lodging",
  "rest",
  "free_time",
  "other",
]);

export const transportTypeSchema = z.enum([
  "flight",
  "train",
  "bus",
  "ferry",
  "car_rental",
  "taxi",
  "rideshare",
  "metro",
  "walking",
  "other",
]);

export const lodgingTypeSchema = z.enum([
  "hotel",
  "airbnb",
  "hostel",
  "apartment",
  "resort",
  "camping",
  "other",
]);

export const budgetCategorySchema = z.enum([
  "lodging",
  "flights",
  "transport",
  "food",
  "activities",
  "shopping",
  "other",
]);

export const tagSchema = z.enum([
  "food",
  "culture",
  "nature",
  "nightlife",
  "shopping",
  "relaxation",
  "adventure",
  "photography",
  "romantic",
  "family_friendly",
  "must_see",
  "hidden_gem",
  "local_favorite",
]);

export const pacePreferenceSchema = z.enum(["relaxed", "balanced", "aggressive"]);
export const walkingToleranceSchema = z.enum(["low", "medium", "high"]);
export const budgetSensitivitySchema = z.enum(["budget", "moderate", "luxury"]);

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const baseEntitySchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  createdBy: z.string().min(1),
});

export const moneySchema = z.object({
  amount: z.number().min(0),
  currency: z.string().min(3).max(3),
});

export const locationSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  placeId: z.string().optional(),
});

export const timeRangeSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

export const dateRangeSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const linkSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  type: z.enum(["booking", "map", "review", "article", "menu", "other"]),
});

export const noteSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1),
  authorId: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  isPinned: z.boolean(),
});

// Inferred types
export type BaseEntityZ = z.infer<typeof baseEntitySchema>;
export type MoneyZ = z.infer<typeof moneySchema>;
export type LocationZ = z.infer<typeof locationSchema>;
export type TimeRangeZ = z.infer<typeof timeRangeSchema>;
export type DateRangeZ = z.infer<typeof dateRangeSchema>;
export type LinkZ = z.infer<typeof linkSchema>;
export type NoteZ = z.infer<typeof noteSchema>;
