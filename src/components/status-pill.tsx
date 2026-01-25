import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";
import {
  Lightbulb,
  FileText,
  Ticket,
  CheckCircle,
  CheckCheck,
  XCircle,
} from "lucide-react";

interface StatusPillProps {
  status: BookingStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    bgColor: string;
    textColor: string;
    icon: React.ElementType;
  }
> = {
  idea: {
    label: "Idea",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    icon: Lightbulb,
  },
  planned: {
    label: "Planned",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    icon: FileText,
  },
  booked: {
    label: "Booked",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    icon: Ticket,
  },
  confirmed: {
    label: "Confirmed",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    bgColor: "bg-green-200",
    textColor: "text-green-800",
    icon: CheckCheck,
  },
  canceled: {
    label: "Canceled",
    bgColor: "bg-red-100",
    textColor: "text-red-600",
    icon: XCircle,
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-sm",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function StatusPill({
  status,
  size = "md",
  showIcon = true,
}: StatusPillProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        config.bgColor,
        config.textColor,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
