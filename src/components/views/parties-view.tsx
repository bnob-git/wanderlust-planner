"use client";

import { useState } from "react";
import { useTripDataStore } from "@/store/trip-data-store";
import { useTripId } from "@/hooks/use-trip-id";
import { useAddParty, useDeleteParty } from "@/hooks/use-trip-mutations";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, calculateDaysBetween } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Users,
  MapPin,
  Calendar,
  Plus,
  ChevronRight,
  UserPlus,
  Crown,
  Edit,
  Trash2,
} from "lucide-react";

const partyColors: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
  green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
  pink: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-300" },
};

export function PartiesView() {
  const { parties, travelers, cities, trip } = useTripDataStore();
  const router = useRouter();
  const tripId = useTripId();
  const addPartyMutation = useAddParty();
  const deletePartyMutation = useDeleteParty();
  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyStartDate, setNewPartyStartDate] = useState("");
  const [newPartyEndDate, setNewPartyEndDate] = useState("");
  const [selectedColor, setSelectedColor] = useState("orange");

  if (!trip) return null;

  const coreParty = parties.find((p) => p.isCore);
  const otherParties = parties.filter((p) => !p.isCore);

  const handleAddParty = () => {
    if (!newPartyName || !newPartyStartDate || !newPartyEndDate) return;
    
    addPartyMutation.mutate({
      tripId: trip.id,
      name: newPartyName,
      color: selectedColor,
      travelerIds: [],
      dateRange: {
        start: newPartyStartDate,
        end: newPartyEndDate,
      },
      cityIds: cities.map((c) => c.id),
      isCore: false,
    });
    
    setNewPartyName("");
    setNewPartyStartDate("");
    setNewPartyEndDate("");
    setSelectedColor("orange");
    setIsAddPartyOpen(false);
  };

  const handleDeleteParty = (partyId: string) => {
    if (confirm("Are you sure you want to delete this party?")) {
      deletePartyMutation.mutate(partyId);
    }
  };

  const getPartyTravelers = (partyId: string) =>
    travelers.filter((t) => t.partyId === partyId);

  const getPartyCities = (cityIds: string[]) =>
    cities.filter((c) => cityIds.includes(c.id));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Travel Parties</h1>
          <p className="text-muted-foreground">
            Manage who&apos;s joining for which parts of the trip
          </p>
        </div>
        <Button onClick={() => setIsAddPartyOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Party
        </Button>
      </div>

      {coreParty && (
        <Card className="mb-6 border-2 border-blue-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                {coreParty.name} (Core Trip)
              </CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Full Trip
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Travelers</p>
                <div className="flex items-center gap-2">
                  {getPartyTravelers(coreParty.id).map((traveler) => (
                    <div key={traveler.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {traveler.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{traveler.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Dates</p>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatDate(coreParty.dateRange.start, { month: "short", day: "numeric" })} -{" "}
                    {formatDate(coreParty.dateRange.end, { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-muted-foreground">
                    ({calculateDaysBetween(coreParty.dateRange.start, coreParty.dateRange.end)} days)
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Destinations</p>
                <div className="flex flex-wrap gap-1">
                  {getPartyCities(coreParty.cityIds).map((city) => (
                    <Badge key={city.id} variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {city.name.split(" ")[0]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="h-5 w-5" />
        Other Parties Joining
      </h2>

      {otherParties.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              No other parties have been added yet
            </p>
            <Button variant="outline" onClick={() => setIsAddPartyOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Invite Friends to Join
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherParties.map((party) => {
            const colors = partyColors[party.color] || partyColors.blue;
            const partyTravelers = getPartyTravelers(party.id);
            const partyCities = getPartyCities(party.cityIds);

            return (
              <Card
                key={party.id}
                className={cn("border-2", colors.border)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", colors.bg.replace("100", "500"))} />
                      {party.name}
                    </CardTitle>
                    <Badge variant="secondary" className={cn(colors.bg, colors.text)}>
                      {calculateDaysBetween(party.dateRange.start, party.dateRange.end)} days
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Travelers</p>
                    <div className="flex items-center gap-1">
                      {partyTravelers.map((traveler) => (
                        <Avatar key={traveler.id} className="h-7 w-7">
                          <AvatarFallback className={cn("text-xs", colors.bg, colors.text)}>
                            {traveler.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {partyTravelers.length === 0 && (
                        <span className="text-sm text-muted-foreground italic">
                          No travelers assigned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDate(party.dateRange.start, { month: "short", day: "numeric" })} -{" "}
                      {formatDate(party.dateRange.end, { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {partyCities.map((city) => (
                      <Badge key={city.id} variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {city.name.split(" ")[0]}
                      </Badge>
                    ))}
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 justify-between"
                      onClick={() => router.push(tripId ? `/trip/${tripId}/itinerary` : "/itinerary")}
                    >
                      View Their Itinerary
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteParty(party.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card className="border-dashed flex items-center justify-center min-h-[200px]">
            <Button variant="ghost" className="flex flex-col gap-2 h-auto py-6" onClick={() => setIsAddPartyOpen(true)}>
              <Plus className="h-8 w-8 text-muted-foreground" />
              <span className="text-muted-foreground">Add Another Party</span>
            </Button>
          </Card>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Trip Overlap Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {parties.map((party) => {
              const colors = partyColors[party.color] || partyColors.blue;
              const startOffset =
                ((new Date(party.dateRange.start).getTime() -
                  new Date(trip.dateRange.start).getTime()) /
                  (new Date(trip.dateRange.end).getTime() -
                    new Date(trip.dateRange.start).getTime())) *
                100;
              const width =
                ((new Date(party.dateRange.end).getTime() -
                  new Date(party.dateRange.start).getTime()) /
                  (new Date(trip.dateRange.end).getTime() -
                    new Date(trip.dateRange.start).getTime())) *
                100;

              return (
                <div key={party.id} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium truncate">
                    {party.name}
                  </div>
                  <div className="flex-1 h-6 bg-muted rounded relative">
                    <div
                      className={cn(
                        "absolute top-0 bottom-0 rounded",
                        party.isCore ? "bg-blue-500" : colors.bg.replace("100", "400")
                      )}
                      style={{
                        left: `${Math.max(0, startOffset)}%`,
                        width: `${Math.min(width, 100 - startOffset)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{formatDate(trip.dateRange.start, { month: "short", day: "numeric" })}</span>
            <span>{formatDate(trip.dateRange.end, { month: "short", day: "numeric" })}</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddPartyOpen} onOpenChange={setIsAddPartyOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsAddPartyOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add New Party</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partyName">Party Name</Label>
              <Input
                id="partyName"
                placeholder="e.g., The Smiths"
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newPartyStartDate}
                  onChange={(e) => setNewPartyStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newPartyEndDate}
                  onChange={(e) => setNewPartyEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {Object.keys(partyColors).map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      partyColors[color].bg.replace("100", "400"),
                      selectedColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                    )}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPartyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddParty}>Add Party</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
