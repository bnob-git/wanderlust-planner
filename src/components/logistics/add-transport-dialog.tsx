"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTripDataStore } from "@/store/trip-data-store";
import { useCreateTransport } from "@/hooks/use-trip-mutations";
import { ExternalLink } from "lucide-react";
import {
  parseFlightString,
  checkFlightStatus,
} from "@/lib/flight-tracking";
import type { TransportType, BookingStatus } from "@/types";

interface AddTransportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const transportTypes: { value: TransportType; label: string }[] = [
  { value: "flight", label: "Flight" },
  { value: "train", label: "Train" },
  { value: "bus", label: "Bus" },
  { value: "ferry", label: "Ferry" },
  { value: "car_rental", label: "Car Rental" },
  { value: "taxi", label: "Taxi/Rideshare" },
  { value: "other", label: "Other" },
];

const statusOptions: { value: BookingStatus; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "planned", label: "Planned" },
  { value: "booked", label: "Booked" },
  { value: "confirmed", label: "Confirmed" },
];

export function AddTransportDialog({ open, onOpenChange }: AddTransportDialogProps) {
  const { trip, travelers } = useTripDataStore();
  const createTransport = useCreateTransport();

  const [type, setType] = useState<TransportType>("flight");
  const [carrier, setCarrier] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [depLocation, setDepLocation] = useState("");
  const [depDateTime, setDepDateTime] = useState("");
  const [depTerminal, setDepTerminal] = useState("");
  const [depGate, setDepGate] = useState("");
  const [arrLocation, setArrLocation] = useState("");
  const [arrDateTime, setArrDateTime] = useState("");
  const [arrTerminal, setArrTerminal] = useState("");
  const [status, setStatus] = useState<BookingStatus>("planned");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [travelClass, setTravelClass] = useState("");
  const [costAmount, setCostAmount] = useState("");
  const [costCurrency, setCostCurrency] = useState("EUR");
  const [selectedTravelerIds, setSelectedTravelerIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [flightSearchInput, setFlightSearchInput] = useState("");

  const resetForm = () => {
    setType("flight");
    setCarrier("");
    setFlightNumber("");
    setDepLocation("");
    setDepDateTime("");
    setDepTerminal("");
    setDepGate("");
    setArrLocation("");
    setArrDateTime("");
    setArrTerminal("");
    setStatus("planned");
    setConfirmationNumber("");
    setBookingRef("");
    setBookingUrl("");
    setTravelClass("");
    setCostAmount("");
    setCostCurrency("EUR");
    setSelectedTravelerIds([]);
    setNotes("");
    setFlightSearchInput("");
  };

  const handleAutoPopulate = () => {
    const parsed = parseFlightString(flightSearchInput);
    if (parsed.airline) setCarrier(parsed.airline);
    if (parsed.flightNumber) setFlightNumber(parsed.flightNumber);
    if (parsed.date) {
      setDepDateTime(parsed.date + "T12:00");
    }
  };

  const handleCheckFlightStatus = () => {
    if (flightNumber) {
      checkFlightStatus({
        airline: carrier,
        flightNumber,
        date: depDateTime.split("T")[0] || new Date().toISOString().split("T")[0],
      });
    }
  };

  const toggleTraveler = (id: string) => {
    setSelectedTravelerIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!trip || !depLocation.trim()) return;

    const depDate = depDateTime ? new Date(depDateTime) : new Date();
    const arrDate = arrDateTime ? new Date(arrDateTime) : new Date(depDate.getTime() + 60 * 60 * 1000);
    const durationMinutes = Math.round((arrDate.getTime() - depDate.getTime()) / 60000);

    createTransport.mutate(
      {
        tripId: trip.id,
        type,
        carrier: carrier || undefined,
        flightNumber: type === "flight" ? flightNumber || undefined : undefined,
        trainNumber: type === "train" ? flightNumber || undefined : undefined,
        departure: {
          location: { name: depLocation },
          dateTime: depDate.toISOString(),
          terminal: depTerminal || undefined,
          gate: depGate || undefined,
        },
        arrival: {
          location: { name: arrLocation },
          dateTime: arrDate.toISOString(),
          terminal: arrTerminal || undefined,
        },
        durationMinutes: Math.max(0, durationMinutes),
        status,
        confirmationNumber: confirmationNumber || undefined,
        bookingReference: bookingRef || undefined,
        bookingUrl: bookingUrl || undefined,
        class: travelClass || undefined,
        totalCost: {
          amount: parseFloat(costAmount) || 0,
          currency: costCurrency,
        },
        travelerIds: selectedTravelerIds,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Failed to add transport:", error);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Transport</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Flight auto-populate */}
          {type === "flight" && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <Label className="text-xs text-muted-foreground">
                Quick fill: paste flight info (e.g. &quot;BA 456 2026-07-01&quot;)
              </Label>
              <div className="flex gap-2">
                <Input
                  value={flightSearchInput}
                  onChange={(e) => setFlightSearchInput(e.target.value)}
                  placeholder="BA 456 2026-07-01"
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={handleAutoPopulate} disabled={!flightSearchInput}>
                  Auto-fill
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as TransportType)}
              >
                {transportTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Carrier / Operator</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. British Airways" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{type === "flight" ? "Flight Number" : type === "train" ? "Train Number" : "Reference"}</Label>
              <Input value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder={type === "flight" ? "BA 456" : "Reference #"} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-sm mb-3">Departure</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={depLocation} onChange={(e) => setDepLocation(e.target.value)} placeholder="Airport / Station" />
              </div>
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input type="datetime-local" value={depDateTime} onChange={(e) => setDepDateTime(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label>Terminal</Label>
                <Input value={depTerminal} onChange={(e) => setDepTerminal(e.target.value)} placeholder="Terminal" />
              </div>
              <div className="space-y-2">
                <Label>Gate / Platform</Label>
                <Input value={depGate} onChange={(e) => setDepGate(e.target.value)} placeholder="Gate or Platform" />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-sm mb-3">Arrival</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={arrLocation} onChange={(e) => setArrLocation(e.target.value)} placeholder="Airport / Station" />
              </div>
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input type="datetime-local" value={arrDateTime} onChange={(e) => setArrDateTime(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div className="space-y-2">
                <Label>Terminal</Label>
                <Input value={arrTerminal} onChange={(e) => setArrTerminal(e.target.value)} placeholder="Terminal" />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-sm mb-3">Booking Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Confirmation Number</Label>
                <Input value={confirmationNumber} onChange={(e) => setConfirmationNumber(e.target.value)} placeholder="Confirmation #" />
              </div>
              <div className="space-y-2">
                <Label>Booking Reference</Label>
                <Input value={bookingRef} onChange={(e) => setBookingRef(e.target.value)} placeholder="Booking reference" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label>Booking URL</Label>
                <Input value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Input value={travelClass} onChange={(e) => setTravelClass(e.target.value)} placeholder="Economy, Business..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label>Cost</Label>
                <Input type="number" value={costAmount} onChange={(e) => setCostAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={costCurrency}
                  onChange={(e) => setCostCurrency(e.target.value)}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>
          </div>

          {/* Travelers selection */}
          {travelers.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-sm mb-3">Travelers</h3>
              <div className="flex flex-wrap gap-2">
                {travelers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTraveler(t.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedTravelerIds.includes(t.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border hover:border-primary/50"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional notes..." />
          </div>

          {/* Check Flight Status stopgap */}
          {type === "flight" && flightNumber && (
            <div className="border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleCheckFlightStatus}
              >
                <ExternalLink className="h-4 w-4" />
                Check Flight Status
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Opens Google Flights to check live status
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!depLocation.trim()}>
            Add Transport
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
