import { z } from "zod";
import {
  baseEntitySchema,
  locationSchema,
  dateRangeSchema,
  walkingToleranceSchema,
} from "./common.schema";

export const neighborhoodSchema = baseEntitySchema.extend({
  cityId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  location: locationSchema,
  vibes: z.array(z.string()),
  walkability: walkingToleranceSchema,
});

export const citySchema = baseEntitySchema.extend({
  tripId: z.string().min(1),
  name: z.string().min(1),
  country: z.string().min(1),
  region: z.string().optional(),
  timezone: z.string().min(1),
  dateRange: dateRangeSchema,
  order: z.number().int().min(1),
  location: locationSchema,
  description: z.string().optional(),
  coverImage: z.string().optional(),
  neighborhoodIds: z.array(z.string()),
  dayIds: z.array(z.string()),
});

export type CityZ = z.infer<typeof citySchema>;
export type NeighborhoodZ = z.infer<typeof neighborhoodSchema>;
