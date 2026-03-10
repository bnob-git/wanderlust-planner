/**
 * Flight Tracking Utility Module
 *
 * This module provides interfaces and utilities for flight status tracking.
 * Currently implements a stopgap approach using external links.
 *
 * TODO: Future integration with flight status APIs:
 * - AviationStack (aviationstack.com)
 * - FlightAware (flightaware.com/aeroapi)
 * - AeroDataBox (rapidapi.com/aedbx-aedbx/api/aerodatabox)
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FlightInfo {
  airline: string;
  flightNumber: string;
  date: string; // YYYY-MM-DD
  departureAirport?: string;
  arrivalAirport?: string;
}

export interface FlightStatus {
  status: "scheduled" | "delayed" | "boarding" | "in_air" | "landed" | "canceled" | "diverted";
  departureTime?: string;
  arrivalTime?: string;
  departureDelay?: number; // minutes
  arrivalDelay?: number; // minutes
  gate?: string;
  terminal?: string;
  lastUpdated: string;
}

/**
 * Interface for future flight status provider implementations.
 * Implement this interface for different data sources (AviationStack, FlightAware, etc.)
 */
export interface FlightStatusProvider {
  /** Provider name for display purposes */
  name: string;

  /** Check if the provider is configured and available */
  isAvailable(): boolean;

  /** Fetch the current status of a flight */
  getFlightStatus(flight: FlightInfo): Promise<FlightStatus | null>;

  /** Search for flights by route and date */
  searchFlights(
    departureAirport: string,
    arrivalAirport: string,
    date: string
  ): Promise<FlightInfo[]>;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Parse a structured flight string into FlightInfo.
 * Accepts formats like:
 *   "BA 123 2026-07-01"
 *   "Ryanair FR1234 2026-07-01"
 *   "AA 456"
 */
export function parseFlightString(input: string): Partial<FlightInfo> {
  const parts = input.trim().split(/\s+/);
  const result: Partial<FlightInfo> = {};

  // Try to find a date (YYYY-MM-DD)
  const dateIdx = parts.findIndex((p) => /^\d{4}-\d{2}-\d{2}$/.test(p));
  if (dateIdx !== -1) {
    result.date = parts[dateIdx];
    parts.splice(dateIdx, 1);
  }

  // Try to find flight number (2 letters + digits, possibly space-separated)
  const flightIdx = parts.findIndex((p) => /^[A-Z]{2}\d+$/i.test(p));
  if (flightIdx !== -1) {
    result.flightNumber = parts[flightIdx].toUpperCase();
    parts.splice(flightIdx, 1);
  } else {
    // Handle space-separated format like "BA 456"
    const codeIdx = parts.findIndex((p) => /^[A-Z]{2}$/i.test(p));
    if (codeIdx !== -1) {
      const numIdx = parts.findIndex((p, i) => i !== codeIdx && /^\d+$/.test(p));
      if (numIdx !== -1) {
        result.flightNumber = (parts[codeIdx] + parts[numIdx]).toUpperCase();
        // Remove both parts (higher index first to avoid shifting)
        const [first, second] = codeIdx < numIdx ? [codeIdx, numIdx] : [numIdx, codeIdx];
        parts.splice(second, 1);
        parts.splice(first, 1);
      }
    }
  }

  // Remaining text is assumed to be the airline name
  if (parts.length > 0) {
    result.airline = parts.join(" ");
  }

  return result;
}

/**
 * Build a Google Flights search URL for a given flight.
 */
export function getGoogleFlightsUrl(flight: FlightInfo): string {
  const query = encodeURIComponent(
    `${flight.airline} ${flight.flightNumber} ${flight.date}`
  );
  return `https://www.google.com/travel/flights?q=${query}`;
}

/**
 * Build an airline website URL based on common airline codes.
 * Falls back to a Google search if the airline is not recognized.
 */
export function getAirlineTrackingUrl(flight: FlightInfo): string {
  const code = flight.flightNumber?.substring(0, 2)?.toUpperCase();

  const airlineUrls: Record<string, string> = {
    BA: "https://www.britishairways.com/travel/managebooking",
    AA: "https://www.aa.com/reservation/view/find-your-reservation",
    UA: "https://www.united.com/en/us/manageres/mytrips/lookup",
    DL: "https://www.delta.com/mytrips",
    FR: "https://www.ryanair.com/gb/en/manage-booking",
    EK: "https://www.emirates.com/us/english/manage-booking/",
    LH: "https://www.lufthansa.com/xx/en/mybooking",
    AF: "https://www.airfrance.com/reservation",
    IB: "https://www.iberia.com/us/manage-your-booking/",
    VY: "https://www.vueling.com/en/my-booking",
  };

  if (code && airlineUrls[code]) {
    return airlineUrls[code];
  }

  // Fallback: search Google
  const query = encodeURIComponent(
    `${flight.airline || ""} flight ${flight.flightNumber} status`
  );
  return `https://www.google.com/search?q=${query}`;
}

/**
 * Open flight status check in a new browser tab.
 * Uses Google Flights as the primary source, with airline website as backup.
 */
export function checkFlightStatus(flight: FlightInfo): void {
  const url = getGoogleFlightsUrl(flight);
  window.open(url, "_blank");
}

// ============================================================================
// TODO: Future API Integration
// ============================================================================

/**
 * TODO: Implement AviationStackProvider
 *
 * class AviationStackProvider implements FlightStatusProvider {
 *   private apiKey: string;
 *   name = "AviationStack";
 *
 *   constructor(apiKey: string) {
 *     this.apiKey = apiKey;
 *   }
 *
 *   isAvailable() {
 *     return !!this.apiKey;
 *   }
 *
 *   async getFlightStatus(flight: FlightInfo): Promise<FlightStatus | null> {
 *     const response = await fetch(
 *       `http://api.aviationstack.com/v1/flights?access_key=${this.apiKey}&flight_iata=${flight.flightNumber}`
 *     );
 *     const data = await response.json();
 *     // Transform response to FlightStatus...
 *     return null;
 *   }
 *
 *   async searchFlights(dep: string, arr: string, date: string): Promise<FlightInfo[]> {
 *     // Implement search...
 *     return [];
 *   }
 * }
 */
