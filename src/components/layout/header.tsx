"use client";

import { useState } from "react";
import { useTripDataStore } from "@/store/trip-data-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, Share2, Check } from "lucide-react";

export function Header() {
  const { trip, travelers, actionItems } = useTripDataStore();
  const pendingActions = actionItems.filter((a) => a.priority === "high" && a.status !== "completed").length;
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">
          {trip?.name || "Plan It"}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          title="Search coming soon"
          className="opacity-50 cursor-not-allowed"
          disabled
        >
          <Search className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title={pendingActions > 0 ? `${pendingActions} pending action items` : "No pending actions"}
          disabled={pendingActions === 0}
        >
          <Bell className="h-5 w-5" />
          {pendingActions > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {pendingActions}
            </span>
          )}
        </Button>

        <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              Share
            </>
          )}
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
