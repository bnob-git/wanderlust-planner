import type { Trip, City, Day, Activity, Reservation, Lodging, TripSettings } from "@/types";
import type {
  ConflictDetectionRequest,
  SuggestionsRequest,
  ParseActivityRequest,
  OptimizeRouteRequest,
} from "./types";

/**
 * Build conflict detection request from store data
 */
export function buildConflictContext(
  day: Day,
  activities: Activity[],
  city: City,
  reservations: Reservation[]
): ConflictDetectionRequest {
  return {
    day: {
      id: day.id,
      date: day.date,
      dayOfWeek: day.dayOfWeek,
      weather: day.weather,
    },
    activities: activities.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      startTime: a.startTime,
      durationMinutes: a.durationMinutes,
      location: a.location
        ? {
            name: a.location.name,
            address: a.location.address,
            latitude: a.location.latitude,
            longitude: a.location.longitude,
          }
        : undefined,
      tags: a.tags,
    })),
    city: {
      name: city.name,
      country: city.country,
    },
    reservations: reservations
      .filter((r) => activities.some((a) => a.reservationId === r.id))
      .map((r) => ({
        id: r.id,
        name: r.name,
        dateTime: r.dateTime,
        activityId: r.activityId,
      })),
  };
}

/**
 * Build suggestions request from store data
 */
export function buildSuggestionsContext(
  tripSettings: TripSettings,
  city: City,
  day: Day,
  existingActivities: Activity[],
  neighborhood?: string,
  timeBlockType?: string
): SuggestionsRequest {
  return {
    tripSettings: {
      pacePreference: tripSettings.pacePreference,
      interests: tripSettings.interests,
    },
    city: {
      name: city.name,
      country: city.country,
    },
    day: {
      date: day.date,
      dayOfWeek: day.dayOfWeek,
    },
    existingActivities: existingActivities.map((a) => ({
      name: a.name,
      type: a.type,
      startTime: a.startTime,
      durationMinutes: a.durationMinutes,
    })),
    neighborhood,
    timeBlockType,
  };
}

/**
 * Build parse activity request from store data
 */
export function buildParseActivityContext(
  input: string,
  day: Day,
  city: City,
  existingActivities: Activity[],
  tripSettings: TripSettings
): ParseActivityRequest {
  return {
    input,
    dayContext: {
      date: day.date,
      city: city.name,
      existingActivities: existingActivities.map((a) => ({
        name: a.name,
        type: a.type,
        startTime: a.startTime,
        durationMinutes: a.durationMinutes,
      })),
    },
    tripSettings: {
      pacePreference: tripSettings.pacePreference,
      timeBlocks: tripSettings.timeBlocks,
    },
  };
}

/**
 * Build route optimization request from store data
 */
export function buildOptimizeRouteContext(
  activities: Activity[],
  city: City,
  lodging?: Lodging
): OptimizeRouteRequest {
  return {
    activities: activities.map((a) => ({
      id: a.id,
      name: a.name,
      location: a.location
        ? {
            name: a.location.name,
            address: a.location.address,
            latitude: a.location.latitude,
            longitude: a.location.longitude,
          }
        : undefined,
      startTime: a.startTime,
      durationMinutes: a.durationMinutes,
    })),
    lodging: lodging
      ? {
          name: lodging.name,
          location: {
            name: lodging.location.name,
            address: lodging.location.address,
            latitude: lodging.location.latitude,
            longitude: lodging.location.longitude,
          },
        }
      : undefined,
    city: {
      name: city.name,
      country: city.country,
    },
  };
}

// Re-export Trip type for context builder consumers
export type { Trip, City, Day, Activity, Reservation, Lodging, TripSettings };
