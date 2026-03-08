import { z } from "zod";
import {
  baseEntitySchema,
  moneySchema,
  timeRangeSchema,
  noteSchema,
  dayStatusSchema,
  timeBlockTypeSchema,
} from "./common.schema";

export const timeBlockSchema = z.object({
  id: z.string().min(1),
  type: timeBlockTypeSchema,
  timeRange: timeRangeSchema,
  activityIds: z.array(z.string()),
});

export const weatherSchema = z.object({
  forecast: z.string(),
  highC: z.number(),
  lowC: z.number(),
  precipitation: z.number().min(0).max(100),
  icon: z.string(),
});

export const daySchema = baseEntitySchema.extend({
  tripId: z.string().min(1),
  cityId: z.string().min(1),
  dayNumber: z.number().int().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayOfWeek: z.string(),
  status: dayStatusSchema,
  theme: z.string().optional(),
  neighborhoodId: z.string().optional(),
  weather: weatherSchema.optional(),
  timeBlocks: z.array(timeBlockSchema),
  notes: z.array(noteSchema),
  budgetEstimate: moneySchema,
  budgetActual: moneySchema.optional(),
  lodgingId: z.string().optional(),
});

export type DayZ = z.infer<typeof daySchema>;
export type TimeBlockZ = z.infer<typeof timeBlockSchema>;
export type WeatherZ = z.infer<typeof weatherSchema>;
