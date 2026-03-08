// Common schemas and enums
export {
  bookingStatusSchema,
  dayStatusSchema,
  timeBlockTypeSchema,
  activityTypeSchema,
  transportTypeSchema,
  lodgingTypeSchema,
  budgetCategorySchema,
  tagSchema,
  pacePreferenceSchema,
  walkingToleranceSchema,
  budgetSensitivitySchema,
  baseEntitySchema,
  moneySchema,
  locationSchema,
  timeRangeSchema,
  dateRangeSchema,
  linkSchema,
  noteSchema,
} from "./common.schema";

// Entity schemas
export { tripSchema, tripSettingsSchema, tripBudgetSchema } from "./trip.schema";
export { activitySchema, transitToNextSchema } from "./activity.schema";
export { daySchema, timeBlockSchema, weatherSchema } from "./day.schema";
export { citySchema, neighborhoodSchema } from "./city.schema";
export { lodgingSchema } from "./lodging.schema";
export { transportSchema } from "./transport.schema";
export { reservationSchema } from "./reservation.schema";
export { budgetItemSchema } from "./budget-item.schema";
export { actionItemSchema } from "./action-item.schema";
export { travelerSchema, partySchema } from "./traveler.schema";

// Inferred types
export type { BaseEntityZ, MoneyZ, LocationZ, TimeRangeZ, DateRangeZ, LinkZ, NoteZ } from "./common.schema";
export type { TripZ, TripSettingsZ, TripBudgetZ } from "./trip.schema";
export type { ActivityZ } from "./activity.schema";
export type { DayZ, TimeBlockZ, WeatherZ } from "./day.schema";
export type { CityZ, NeighborhoodZ } from "./city.schema";
export type { LodgingZ } from "./lodging.schema";
export type { TransportZ } from "./transport.schema";
export type { ReservationZ } from "./reservation.schema";
export type { BudgetItemZ } from "./budget-item.schema";
export type { ActionItemZ } from "./action-item.schema";
export type { TravelerZ, PartyZ } from "./traveler.schema";
