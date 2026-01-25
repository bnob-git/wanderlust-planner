"use client";

import { useTripStore } from "@/store/trip-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/status-pill";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import type { Transport, Lodging, Reservation } from "@/types";
import {
  Plane,
  Train,
  Bus,
  Ship,
  Car,
  Hotel,
  Ticket,
  MapPin,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  FileText,
  Calendar,
  Users,
  Navigation,
  Copy,
  CheckCircle,
} from "lucide-react";

function TransportCard({ transport }: { transport: Transport }) {
  const { travelers, getTraveler } = useTripStore();

  const getIcon = () => {
    switch (transport.type) {
      case "flight":
        return <Plane className="h-5 w-5 text-blue-500" />;
      case "train":
        return <Train className="h-5 w-5 text-green-500" />;
      case "bus":
        return <Bus className="h-5 w-5 text-orange-500" />;
      case "ferry":
        return <Ship className="h-5 w-5 text-cyan-500" />;
      default:
        return <Car className="h-5 w-5 text-gray-500" />;
    }
  };

  const departureDate = new Date(transport.departure.dateTime);
  const arrivalDate = new Date(transport.arrival.dateTime);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-muted">{getIcon()}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {transport.flightNumber || transport.trainNumber || transport.carrier}
                  </h3>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {transport.departure.location.name.split(",")[0]} →{" "}
                    {transport.arrival.location.name.split(",")[0]}
                  </span>
                </div>
                {transport.carrier && (
                  <p className="text-sm text-muted-foreground">{transport.carrier}</p>
                )}
              </div>
              <StatusPill status={transport.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Departure
                </p>
                <p className="font-medium">
                  {formatDate(departureDate, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-lg font-bold">
                  {formatTime(
                    `${departureDate.getHours().toString().padStart(2, "0")}:${departureDate.getMinutes().toString().padStart(2, "0")}`
                  )}
                </p>
                {transport.departure.terminal && (
                  <p className="text-sm text-muted-foreground">
                    Terminal {transport.departure.terminal}
                    {transport.departure.gate && `, Gate ${transport.departure.gate}`}
                    {transport.departure.platform &&
                      `, Platform ${transport.departure.platform}`}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Arrival
                </p>
                <p className="font-medium">
                  {formatDate(arrivalDate, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-lg font-bold">
                  {formatTime(
                    `${arrivalDate.getHours().toString().padStart(2, "0")}:${arrivalDate.getMinutes().toString().padStart(2, "0")}`
                  )}
                </p>
                {transport.arrival.terminal && (
                  <p className="text-sm text-muted-foreground">
                    Terminal {transport.arrival.terminal}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {Math.floor(transport.durationMinutes / 60)}h{" "}
                  {transport.durationMinutes % 60}m
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{transport.travelerIds.length} travelers</span>
              </div>
              {transport.class && (
                <div className="flex items-center gap-1">
                  <span>{transport.class}</span>
                </div>
              )}
            </div>

            {transport.seatAssignments &&
              Object.keys(transport.seatAssignments).length > 0 && (
                <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                  <p className="font-medium mb-1">Seat Assignments</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(transport.seatAssignments).map(
                      ([travelerId, seat]) => {
                        const traveler = getTraveler(travelerId);
                        return (
                          <span
                            key={travelerId}
                            className="px-2 py-1 bg-background rounded text-xs"
                          >
                            {traveler?.name.split(" ")[0]}: {seat}
                          </span>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="flex items-center gap-2">
                {transport.confirmationNumber && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-muted-foreground">Conf:</span>
                    <code className="px-2 py-0.5 bg-muted rounded font-mono">
                      {transport.confirmationNumber}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(transport.confirmationNumber || "");
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {formatCurrency(
                    transport.totalCost.amount,
                    transport.totalCost.currency
                  )}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const event = {
                      title: `${transport.flightNumber || transport.trainNumber || transport.carrier}`,
                      start: new Date(transport.departure.dateTime),
                      end: new Date(transport.arrival.dateTime),
                    };
                    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${event.end.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
                    window.open(googleCalUrl, "_blank");
                  }}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Add to Calendar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LodgingCard({ lodging }: { lodging: Lodging }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-950">
            <Hotel className="h-5 w-5 text-purple-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{lodging.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {lodging.type}
                  {lodging.roomType && ` • ${lodging.roomType}`}
                </p>
              </div>
              <StatusPill status={lodging.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Check-in
                </p>
                <p className="font-medium">
                  {formatDate(lodging.checkIn.date, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-lg font-bold">
                  {formatTime(lodging.checkIn.time)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Check-out
                </p>
                <p className="font-medium">
                  {formatDate(lodging.checkOut.date, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-lg font-bold">
                  {formatTime(lodging.checkOut.time)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{lodging.nightCount} nights</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate max-w-[250px]">
                  {lodging.location.address}
                </span>
              </div>
            </div>

            {lodging.amenities && lodging.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {lodging.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-2 py-0.5 bg-muted rounded text-xs capitalize"
                  >
                    {amenity.replace("_", " ")}
                  </span>
                ))}
              </div>
            )}

            {lodging.checkInInstructions && (
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-sm">
                <p className="font-medium">📋 Check-in Instructions</p>
                <p className="text-muted-foreground">{lodging.checkInInstructions}</p>
              </div>
            )}

            {lodging.wifiPassword && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                <span className="text-muted-foreground">WiFi Password: </span>
                <code className="font-mono">{lodging.wifiPassword}</code>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="flex items-center gap-2">
                {lodging.confirmationNumber && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-muted-foreground">Conf:</span>
                    <code className="px-2 py-0.5 bg-muted rounded font-mono">
                      {lodging.confirmationNumber}
                    </code>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {formatCurrency(lodging.totalCost.amount, lodging.totalCost.currency)}
                </span>
                {lodging.isPrepaid && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Prepaid
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const query = encodeURIComponent(lodging.location.address || lodging.name);
                  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
                }}
              >
                <Navigation className="h-4 w-4 mr-1" />
                Navigate
              </Button>
              {lodging.contactPhone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`tel:${lodging.contactPhone}`, "_self")}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
              )}
              {lodging.contactEmail && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`mailto:${lodging.contactEmail}`, "_self")}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
              )}
              {lodging.bookingUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(lodging.bookingUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Booking
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const dateTime = new Date(reservation.dateTime);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-950">
            <Ticket className="h-5 w-5 text-orange-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{reservation.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {reservation.type}
                </p>
              </div>
              <StatusPill status={reservation.status} />
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatDate(dateTime, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatTime(
                    `${dateTime.getHours().toString().padStart(2, "0")}:${dateTime.getMinutes().toString().padStart(2, "0")}`
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{reservation.partySize} guests</span>
              </div>
            </div>

            {reservation.location && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{reservation.location.address}</span>
              </div>
            )}

            {reservation.specialRequests && (
              <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                <p className="text-muted-foreground">
                  📝 {reservation.specialRequests}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="flex items-center gap-2">
                {reservation.confirmationNumber && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-muted-foreground">Conf:</span>
                    <code className="px-2 py-0.5 bg-muted rounded font-mono">
                      {reservation.confirmationNumber}
                    </code>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {reservation.cost && (
                  <span className="font-semibold">
                    {formatCurrency(
                      reservation.cost.amount,
                      reservation.cost.currency
                    )}
                  </span>
                )}
                {reservation.isPrepaid && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Prepaid
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {reservation.location && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const query = encodeURIComponent(reservation.location?.address || reservation.name);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
                  }}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Navigate
                </Button>
              )}
              {reservation.contactPhone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`tel:${reservation.contactPhone}`, "_self")}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LogisticsView() {
  const { transports, lodgings, reservations } = useTripStore();

  const flights = transports.filter((t) => t.type === "flight");
  const trains = transports.filter((t) => t.type === "train");
  const otherTransport = transports.filter(
    (t) => t.type !== "flight" && t.type !== "train"
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Logistics & Bookings</h1>
        <p className="text-muted-foreground">
          All your travel arrangements in one place
        </p>
      </div>

      <Tabs defaultValue="transport" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transport" className="gap-2">
            <Plane className="h-4 w-4" />
            Transport ({transports.length})
          </TabsTrigger>
          <TabsTrigger value="lodging" className="gap-2">
            <Hotel className="h-4 w-4" />
            Lodging ({lodgings.length})
          </TabsTrigger>
          <TabsTrigger value="reservations" className="gap-2">
            <Ticket className="h-4 w-4" />
            Reservations ({reservations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transport" className="space-y-4">
          {flights.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Flights
              </h2>
              <div className="space-y-3">
                {flights.map((transport) => (
                  <TransportCard key={transport.id} transport={transport} />
                ))}
              </div>
            </div>
          )}

          {trains.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Train className="h-5 w-5" />
                Trains
              </h2>
              <div className="space-y-3">
                {trains.map((transport) => (
                  <TransportCard key={transport.id} transport={transport} />
                ))}
              </div>
            </div>
          )}

          {otherTransport.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Car className="h-5 w-5" />
                Other Transport
              </h2>
              <div className="space-y-3">
                {otherTransport.map((transport) => (
                  <TransportCard key={transport.id} transport={transport} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="lodging" className="space-y-4">
          {lodgings.map((lodging) => (
            <LodgingCard key={lodging.id} lodging={lodging} />
          ))}
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          {reservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
