import type { ActivityType, Tag } from "@/types";

// ============================================================================
// Conflict Detection
// ============================================================================

export interface ConflictDetectionRequest {
  day: {
    id: string;
    date: string;
    dayOfWeek: string;
    weather?: {
      forecast: string;
      highC: number;
      lowC: number;
      precipitation: number;
      icon: string;
    };
  };
  activities: Array<{
    id: string;
    name: string;
    type: ActivityType;
    startTime?: string;
    durationMinutes: number;
    location?: {
      name: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    };
    tags: Tag[];
  }>;
  city: {
    name: string;
    country: string;
  };
  reservations: Array<{
    id: string;
    name: string;
    dateTime: string;
    activityId?: string;
  }>;
}

export interface Conflict {
  activityId: string;
  severity: "warning" | "error";
  message: string;
  suggestion?: string;
}

export interface ConflictDetectionResponse {
  conflicts: Conflict[];
}

// ============================================================================
// Smart Suggestions
// ============================================================================

export interface SuggestionsRequest {
  tripSettings: {
    pacePreference: string;
    interests: {
      food: number;
      culture: number;
      nature: number;
      nightlife: number;
      shopping: number;
      relaxation: number;
    };
  };
  city: {
    name: string;
    country: string;
  };
  day: {
    date: string;
    dayOfWeek: string;
  };
  existingActivities: Array<{
    name: string;
    type: ActivityType;
    startTime?: string;
    durationMinutes: number;
  }>;
  neighborhood?: string;
  timeBlockType?: string;
}

export interface Suggestion {
  name: string;
  type: ActivityType;
  description: string;
  estimatedDuration: number;
  tags: Tag[];
  reason: string;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
}

// ============================================================================
// Natural Language Input
// ============================================================================

export interface ParseActivityRequest {
  input: string;
  dayContext: {
    date: string;
    city: string;
    existingActivities: Array<{
      name: string;
      type: ActivityType;
      startTime?: string;
      durationMinutes: number;
    }>;
  };
  tripSettings: {
    pacePreference: string;
    timeBlocks: {
      morning: { start: string; end: string };
      afternoon: { start: string; end: string };
      evening: { start: string; end: string };
    };
  };
}

export interface ParsedActivity {
  name: string;
  type: ActivityType;
  description?: string;
  startTime?: string;
  durationMinutes: number;
  tags: Tag[];
  estimatedCost?: number;
  location?: string;
}

export interface ParseActivityResponse {
  activity: ParsedActivity;
}

// ============================================================================
// Route Optimization
// ============================================================================

export interface OptimizeRouteRequest {
  activities: Array<{
    id: string;
    name: string;
    location?: {
      name: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    };
    startTime?: string;
    durationMinutes: number;
  }>;
  lodging?: {
    name: string;
    location?: {
      name: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    };
  };
  city: {
    name: string;
    country: string;
  };
}

export interface OptimizeRouteResponse {
  optimizedOrder: string[];
  estimatedTimeSaved: number;
  explanation: string;
}
