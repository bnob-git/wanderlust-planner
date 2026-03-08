import { z } from "zod";
import {
  baseEntitySchema,
  moneySchema,
  locationSchema,
  bookingStatusSchema,
} from "./common.schema";

export const reservationSchema = baseEntitySchema.extend({
  tripId: z.string().min(1),
  activityId: z.string().optional(),
  name: z.string().min(1),
  type: z.enum(["restaurant", "tour", "ticket", "experience", "spa", "other"]),
  dateTime: z.string(),
  durationMinutes: z.number().min(0).optional(),
  location: locationSchema.optional(),
  status: bookingStatusSchema,
  confirmationNumber: z.string().optional(),
  bookingPlatform: z.string().optional(),
  bookingUrl: z.string().optional(),
  partySize: z.number().int().min(1),
  specialRequests: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  cost: moneySchema.optional(),
  isPrepaid: z.boolean(),
  depositAmount: moneySchema.optional(),
  cancellationPolicy: z.string().optional(),
  cancellationDeadline: z.string().optional(),
  fileIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type ReservationZ = z.infer<typeof reservationSchema>;
