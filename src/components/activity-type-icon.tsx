import type { ActivityType, TransportType } from "@/types";
import {
  Camera,
  Building2,
  UtensilsCrossed,
  Coffee,
  Wine,
  Music,
  ShoppingBag,
  Umbrella,
  TreePine,
  Users,
  Theater,
  Plane,
  Car,
  Train,
  Bus,
  Ship,
  Footprints,
  Bed,
  Moon,
  Clock,
  MapPin,
} from "lucide-react";

const activityIcons: Record<ActivityType, React.ElementType> = {
  sightseeing: Camera,
  museum: Building2,
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  bar: Wine,
  nightclub: Music,
  shopping: ShoppingBag,
  beach: Umbrella,
  park: TreePine,
  tour: Users,
  show: Theater,
  transport: Plane,
  transit: Car,
  lodging: Bed,
  rest: Moon,
  free_time: Clock,
  other: MapPin,
};

const transportIcons: Record<TransportType, React.ElementType> = {
  flight: Plane,
  train: Train,
  bus: Bus,
  ferry: Ship,
  car_rental: Car,
  taxi: Car,
  rideshare: Car,
  metro: Train,
  walking: Footprints,
  other: MapPin,
};

interface ActivityTypeIconProps {
  type: ActivityType;
  className?: string;
}

interface TransportTypeIconProps {
  type: TransportType;
  className?: string;
}

export function ActivityTypeIcon({ type, className }: ActivityTypeIconProps) {
  const Icon = activityIcons[type] || MapPin;
  return <Icon className={className} />;
}

export function TransportTypeIcon({ type, className }: TransportTypeIconProps) {
  const Icon = transportIcons[type] || MapPin;
  return <Icon className={className} />;
}
