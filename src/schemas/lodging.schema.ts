import { z } from "zod";
import {
  baseEntitySchema,
  moneySchema,
  locationSchema,
  bookingStatusSchema,
  lodgingTypeSchema,
} from "./common.schema";

export const lodgingSchema = baseEntitySchema.extend({
  tripId: z.string().min(1),
  cityId: z.string().min(1),
  name: z.string().min(1),
  type: lodgingTypeSchema,
  checkIn: z.object({ date: z.string(), time: z.string() }),
  checkOut: z.object({ date: z.string(), time: z.string() }),
  nightCount: z.number().int().min(1),
  location: locationSchema,
  status: bookingStatusSchema,
  confirmationNumber: z.string().optional(),
  bookingPlatform: z.string().optional(),
  bookingUrl: z.string().optional(),
  roomType: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  wifiPassword: z.string().optional(),
  checkInInstructions: z.string().optional(),
  houseRules: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  hostName: z.string().optional(),
  totalCost: moneySchema,
  costPerNight: moneySchema,
  isPrepaid: z.boolean(),
  fileIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type LodgingZ = z.infer<typeof lodgingSchema>;
