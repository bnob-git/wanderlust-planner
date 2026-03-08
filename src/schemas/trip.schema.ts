import { z } from "zod";
import {
  baseEntitySchema,
  moneySchema,
  dateRangeSchema,
  timeRangeSchema,
  pacePreferenceSchema,
  walkingToleranceSchema,
  budgetSensitivitySchema,
  budgetCategorySchema,
} from "./common.schema";

export const tripSettingsSchema = z.object({
  pacePreference: pacePreferenceSchema,
  walkingTolerance: walkingToleranceSchema,
  budgetSensitivity: budgetSensitivitySchema,
  interests: z.object({
    food: z.number().min(0).max(100),
    culture: z.number().min(0).max(100),
    nature: z.number().min(0).max(100),
    nightlife: z.number().min(0).max(100),
    shopping: z.number().min(0).max(100),
    relaxation: z.number().min(0).max(100),
  }),
  schedule: z.object({
    typicalWakeTime: z.string(),
    typicalSleepTime: z.string(),
    breakfastPreference: z.enum(["skip", "light", "full"]),
    lunchDurationMinutes: z.number().min(0),
    dinnerTime: z.string(),
  }),
  timeBlocks: z.object({
    morning: timeRangeSchema,
    afternoon: timeRangeSchema,
    evening: timeRangeSchema,
  }),
});

export const tripBudgetSchema = z.object({
  total: moneySchema,
  byCategory: z.record(budgetCategorySchema, moneySchema),
  perPersonDaily: moneySchema.optional(),
});

export const tripSchema = baseEntitySchema.extend({
  name: z.string().min(1),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  dateRange: dateRangeSchema,
  status: z.enum(["planning", "upcoming", "active", "completed", "archived"]),
  settings: tripSettingsSchema,
  budget: tripBudgetSchema,
  isPublic: z.boolean(),
  shareCode: z.string().optional(),
  travelerIds: z.array(z.string()),
  cityIds: z.array(z.string()),
});

export type TripZ = z.infer<typeof tripSchema>;
export type TripSettingsZ = z.infer<typeof tripSettingsSchema>;
export type TripBudgetZ = z.infer<typeof tripBudgetSchema>;
