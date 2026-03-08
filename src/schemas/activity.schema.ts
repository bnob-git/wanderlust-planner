import { z } from "zod";
import {
  baseEntitySchema,
  moneySchema,
  locationSchema,
  linkSchema,
  activityTypeSchema,
  bookingStatusSchema,
  transportTypeSchema,
  tagSchema,
} from "./common.schema";

export const transitToNextSchema = z.object({
  mode: transportTypeSchema,
  durationMinutes: z.number().min(0),
  distance: z.string().optional(),
  cost: moneySchema.optional(),
  notes: z.string().optional(),
});

export const activitySchema = baseEntitySchema.extend({
  tripId: z.string().min(1),
  dayId: z.string().min(1),
  timeBlockId: z.string().min(1),
  name: z.string().min(1),
  type: activityTypeSchema,
  description: z.string().optional(),
  startTime: z.string().optional(),
  durationMinutes: z.number().min(0),
  isFlexible: z.boolean(),
  location: locationSchema.optional(),
  status: bookingStatusSchema,
  reservationId: z.string().optional(),
  tags: z.array(tagSchema),
  priority: z.enum(["must_do", "should_do", "nice_to_have"]),
  cost: moneySchema.optional(),
  costSplit: z.union([
    z.literal("all"),
    z.literal("per_person"),
    z.array(z.string()),
  ]),
  transitToNext: transitToNextSchema.optional(),
  tips: z.string().optional(),
  alternatives: z.array(z.string()).optional(),
  links: z.array(linkSchema).optional(),
  order: z.number().min(0),
});

export type ActivityZ = z.infer<typeof activitySchema>;
