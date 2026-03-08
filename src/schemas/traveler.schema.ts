import { z } from "zod";
import { baseEntitySchema } from "./common.schema";

export const travelerSchema = baseEntitySchema.extend({
  tripId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  role: z.enum(["owner", "editor", "viewer"]),
  partyId: z.string().min(1),
  dietaryRestrictions: z.array(z.string()).optional(),
  accessibilityNeeds: z.array(z.string()).optional(),
  emergencyContact: z
    .object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string(),
    })
    .optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
});

export const partySchema = baseEntitySchema.extend({
  tripId: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
  travelerIds: z.array(z.string()),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
  cityIds: z.array(z.string()),
  isCore: z.boolean(),
});

export type TravelerZ = z.infer<typeof travelerSchema>;
export type PartyZ = z.infer<typeof partySchema>;
