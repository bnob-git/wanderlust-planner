import { z } from "zod";
import {
  baseEntitySchema,
  moneySchema,
  locationSchema,
  bookingStatusSchema,
  transportTypeSchema,
} from "./common.schema";

export const transportSchema = baseEntitySchema.extend({
  tripId: z.string().min(1),
  type: transportTypeSchema,
  departure: z.object({
    location: locationSchema,
    dateTime: z.string(),
    terminal: z.string().optional(),
    gate: z.string().optional(),
    platform: z.string().optional(),
  }),
  arrival: z.object({
    location: locationSchema,
    dateTime: z.string(),
    terminal: z.string().optional(),
  }),
  durationMinutes: z.number().min(0),
  status: bookingStatusSchema,
  carrier: z.string().optional(),
  flightNumber: z.string().optional(),
  trainNumber: z.string().optional(),
  confirmationNumber: z.string().optional(),
  bookingReference: z.string().optional(),
  bookingUrl: z.string().optional(),
  class: z.string().optional(),
  seatAssignments: z.record(z.string(), z.string()).optional(),
  totalCost: moneySchema,
  travelerIds: z.array(z.string()),
  fileIds: z.array(z.string()).optional(),
  departureDayId: z.string().optional(),
  arrivalDayId: z.string().optional(),
  notes: z.string().optional(),
});

export type TransportZ = z.infer<typeof transportSchema>;
