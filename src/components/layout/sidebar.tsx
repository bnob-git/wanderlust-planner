"use client";

import { cn } from "@/lib/utils";
import { useTripDataStore } from "@/store/trip-data-store";
import { useTripId } from "@/hooks/use-trip-id";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Home,
  LogOut,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const tripNavItems = [
  {
    id: "command-center",
    label: "Command Center",
    icon: LayoutDashboard,
    path: "command-center",
  },
  { id: "timeline", label: "Timeline", icon: Calendar, path: "timeline" },
  { id: "itinerary", label: "Day-by-Day", icon: ListTodo, path: "itinerary" },
  { id: "parties", label: "Parties", icon: Users, path: "parties" },
  { id: "logistics", label: "Logistics", icon: Plane, path: "logistics" },
  { id: "tasks", label: "Tasks", icon: CheckSquare, path: "tasks" },
  { id: "budget", label: "Budget", icon: Wallet, path: "budget" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { trip } = useTripDataStore();
  const pathname = usePathname();
  const router = useRouter();
  const tripId = useTripId();
  const currentTripId = tripId || trip?.id;

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

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
            <span className="font-semibold text-lg">Plan It</span>
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
        <Link href="/">
          <Button
            variant={pathname === "/" ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3",
              collapsed && "justify-center px-2"
            )}
          >
            <Home className="h-5 w-5" />
            {!collapsed && <span>All Trips</span>}
          </Button>
        </Link>
        {currentTripId && (
          <>
            {!collapsed && (
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current Trip
              </div>
            )}
            {tripNavItems.map((item) => {
              const href = `/trip/${currentTripId}/${item.path}`;
              const isActive = pathname?.includes(`/${item.path}`) ?? false;
              return (
                <Link key={item.id} href={href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span>{item.label}</span>}
                  </Button>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="border-t p-2 space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 opacity-50 cursor-not-allowed",
            collapsed && "justify-center px-2"
          )}
          disabled
          title="Settings coming soon"
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>Settings</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
            collapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sign Out</span>}
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
