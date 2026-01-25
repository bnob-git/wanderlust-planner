"use client";

import { useTripStore } from "@/store/trip-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandCenter } from "@/components/views/command-center";
import { TimelineView } from "@/components/views/timeline-view";
import { ItineraryView } from "@/components/views/itinerary-view";
import { LogisticsView } from "@/components/views/logistics-view";
import { BudgetView } from "@/components/views/budget-view";
import { PartiesView } from "@/components/views/parties-view";

export default function Home() {
  const { activeView } = useTripStore();

  const renderView = () => {
    switch (activeView) {
      case "command-center":
        return <CommandCenter />;
      case "timeline":
        return <TimelineView />;
      case "itinerary":
        return <ItineraryView />;
      case "parties":
        return <PartiesView />;
      case "logistics":
        return <LogisticsView />;
      case "budget":
        return <BudgetView />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-muted/30">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
