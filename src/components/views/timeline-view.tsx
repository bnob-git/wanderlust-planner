"use client";

import { useState } from "react";
import { useTripStore } from "@/store/trip-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, calculateDaysBetween } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Calendar,
  MapPin,
  Hotel,
  Plane,
  Train,
} from "lucide-react";

const cityColors = [
  { bg: "bg-blue-500", light: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-500", light: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-green-500", light: "bg-green-100", text: "text-green-700" },
  { bg: "bg-pink-500", light: "bg-pink-100", text: "text-pink-700" },
];

const dayThemeEmojis: Record<string, string> = {
  arrival: "✈️",
  departure: "✈️",
  art: "🎨",
  culture: "🏛️",
  food: "🍽️",
  beach: "🏖️",
  nature: "🌿",
  shopping: "🛍️",
  rest: "😴",
  travel: "🚄",
};

function getThemeEmoji(theme?: string): string {
  if (!theme) return "📅";
  const lowerTheme = theme.toLowerCase();
  for (const [key, emoji] of Object.entries(dayThemeEmojis)) {
    if (lowerTheme.includes(key)) return emoji;
  }
  return "📅";
}

export function TimelineView() {
  const { trip, cities, days, lodgings, transports, setActiveView, setSelectedDay } =
    useTripStore();
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No trip loaded</p>
      </div>
    );
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));

  const totalDays = calculateDaysBetween(trip.dateRange.start, trip.dateRange.end);
  const startDate = new Date(trip.dateRange.start);

  const getDayOffset = (date: string) => {
    const d = new Date(date);
    return Math.floor((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDayWidth = (start: string, end: string) => {
    return calculateDaysBetween(start, end);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Trip Timeline</h1>
          <p className="text-muted-foreground">
            {formatDate(trip.dateRange.start, { month: "long", day: "numeric" })} -{" "}
            {formatDate(trip.dateRange.end, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= 2}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div style={{ minWidth: `${800 * zoomLevel}px` }}>
            <div className="flex border-b bg-muted/30">
              <div className="w-32 shrink-0 p-3 font-medium text-sm border-r">
                Phase
              </div>
              <div className="flex-1 flex">
                {Array.from({ length: totalDays }).map((_, i) => {
                  const date = new Date(startDate);
                  date.setDate(date.getDate() + i);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 min-w-[50px] p-2 text-center border-r text-xs",
                        isWeekend && "bg-muted/50"
                      )}
                    >
                      <div className="font-medium">
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className="text-muted-foreground">
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex border-b">
              <div className="w-32 shrink-0 p-3 font-medium text-sm border-r flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Cities
              </div>
              <div className="flex-1 relative h-16">
                {cities.map((city, index) => {
                  const offset = getDayOffset(city.dateRange.start);
                  const width = getDayWidth(city.dateRange.start, city.dateRange.end);
                  const color = cityColors[index % cityColors.length];

                  return (
                    <div
                      key={city.id}
                      className={cn(
                        "absolute top-2 bottom-2 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-sm cursor-pointer hover:opacity-90 transition-opacity",
                        color.bg
                      )}
                      style={{
                        left: `${(offset / totalDays) * 100}%`,
                        width: `${(width / totalDays) * 100}%`,
                      }}
                      title={`${city.name}: ${formatDate(city.dateRange.start)} - ${formatDate(city.dateRange.end)}`}
                    >
                      {city.name}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex border-b">
              <div className="w-32 shrink-0 p-3 font-medium text-sm border-r flex items-center gap-2">
                <Hotel className="h-4 w-4" />
                Lodging
              </div>
              <div className="flex-1 relative h-14">
                {lodgings.map((lodging, index) => {
                  const offset = getDayOffset(lodging.checkIn.date);
                  const width = lodging.nightCount;
                  const cityIndex = cities.findIndex((c) => c.id === lodging.cityId);
                  const color = cityColors[cityIndex % cityColors.length];

                  return (
                    <div
                      key={lodging.id}
                      className={cn(
                        "absolute top-2 bottom-2 rounded border-2 flex items-center px-2 text-xs font-medium truncate cursor-pointer hover:shadow-md transition-shadow",
                        color.light,
                        color.text,
                        `border-${color.bg.replace("bg-", "")}`
                      )}
                      style={{
                        left: `${(offset / totalDays) * 100}%`,
                        width: `${(width / totalDays) * 100}%`,
                        borderColor: color.bg.replace("bg-", "").includes("500")
                          ? undefined
                          : undefined,
                      }}
                      title={`${lodging.name}: ${lodging.nightCount} nights`}
                    >
                      {lodging.name}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex border-b">
              <div className="w-32 shrink-0 p-3 font-medium text-sm border-r flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Transport
              </div>
              <div className="flex-1 relative h-12">
                {transports.map((transport) => {
                  const departureDate = new Date(transport.departure.dateTime);
                  const offset = getDayOffset(
                    departureDate.toISOString().split("T")[0]
                  );

                  const Icon = transport.type === "flight" ? Plane : Train;

                  return (
                    <div
                      key={transport.id}
                      className="absolute top-2 bottom-2 flex items-center justify-center cursor-pointer"
                      style={{
                        left: `${(offset / totalDays) * 100}%`,
                        width: `${(1 / totalDays) * 100}%`,
                      }}
                      title={`${transport.flightNumber || transport.trainNumber}: ${transport.departure.location.name.split(",")[0]} → ${transport.arrival.location.name.split(",")[0]}`}
                    >
                      <div className="p-1.5 rounded-full bg-blue-100 text-blue-600">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex">
              <div className="w-32 shrink-0 p-3 font-medium text-sm border-r flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Days
              </div>
              <div className="flex-1 flex">
                {days.map((day) => {
                  const cityIndex = cities.findIndex((c) => c.id === day.cityId);
                  const color = cityColors[cityIndex % cityColors.length];
                  const emoji = getThemeEmoji(day.theme);

                  return (
                    <div
                      key={day.id}
                      className={cn(
                        "flex-1 min-w-[50px] p-2 text-center border-r cursor-pointer hover:bg-muted/50 transition-colors",
                        day.status === "locked" && "bg-green-50 dark:bg-green-950/20"
                      )}
                      onClick={() => {
                        setSelectedDay(day.id);
                        setActiveView("itinerary");
                      }}
                      title={day.theme || `Day ${day.dayNumber}`}
                    >
                      <div className="text-lg">{emoji}</div>
                      <div className="text-xs text-muted-foreground">
                        D{day.dayNumber}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city, index) => {
          const color = cityColors[index % cityColors.length];
          const cityDays = days.filter((d) => d.cityId === city.id);
          const cityLodging = lodgings.find((l) => l.cityId === city.id);

          return (
            <Card key={city.id} className="overflow-hidden">
              <div className={cn("h-2", color.bg)} />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className={cn("h-4 w-4", color.text)} />
                  {city.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dates</span>
                    <span>
                      {formatDate(city.dateRange.start, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {formatDate(city.dateRange.end, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{cityDays.length} days</span>
                  </div>
                  {cityLodging && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lodging</span>
                      <span className="truncate max-w-[150px]">
                        {cityLodging.name}
                      </span>
                    </div>
                  )}
                </div>
                {city.description && (
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                    {city.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
