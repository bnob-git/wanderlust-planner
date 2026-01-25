"use client";

import { cn } from "@/lib/utils";
import { useTripStore } from "@/store/trip-store";
import {
  LayoutDashboard,
  Calendar,
  ListTodo,
  Plane,
  Wallet,
  Settings,
  ChevronLeft,
  Globe,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  {
    id: "command-center" as const,
    label: "Command Center",
    icon: LayoutDashboard,
  },
  { id: "timeline" as const, label: "Timeline", icon: Calendar },
  { id: "itinerary" as const, label: "Day-by-Day", icon: ListTodo },
  { id: "parties" as const, label: "Parties", icon: Users },
  { id: "logistics" as const, label: "Logistics", icon: Plane },
  { id: "budget" as const, label: "Budget", icon: Wallet },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { activeView, setActiveView, trip } = useTripStore();

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Wanderlust</span>
          </div>
        )}
        {collapsed && <Globe className="h-6 w-6 text-primary mx-auto" />}
      </div>

      {!collapsed && trip && (
        <div className="border-b p-4">
          <p className="text-sm font-medium truncate">{trip.name}</p>
          <p className="text-xs text-muted-foreground">
            {trip.dateRange.start} → {trip.dateRange.end}
          </p>
        </div>
      )}

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeView === item.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3",
              collapsed && "justify-center px-2"
            )}
            onClick={() => setActiveView(item.id)}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>Settings</span>}
        </Button>
      </div>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>
    </aside>
  );
}
