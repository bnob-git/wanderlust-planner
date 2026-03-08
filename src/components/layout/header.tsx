"use client";

import { useTripDataStore } from "@/store/trip-data-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, Share2 } from "lucide-react";

export function Header() {
  const { trip, travelers, actionItems } = useTripDataStore();
  const pendingActions = actionItems.filter((a) => a.priority === "high" && a.status !== "completed").length;

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">
          {trip?.name || "Wanderlust Planner"}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingActions > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {pendingActions}
            </span>
          )}
        </Button>

        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>

        <div className="flex -space-x-2 ml-2">
          {travelers.slice(0, 4).map((traveler) => (
            <Avatar key={traveler.id} className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="text-xs">
                {traveler.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
    </header>
  );
}
