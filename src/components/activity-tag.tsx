import { cn } from "@/lib/utils";
import type { Tag } from "@/types";
import { X } from "lucide-react";

interface ActivityTagProps {
  tag: Tag;
  size?: "sm" | "md";
  removable?: boolean;
  onRemove?: () => void;
}

const tagConfig: Record<
  Tag,
  { label: string; emoji: string; bgColor: string; textColor: string }
> = {
  food: {
    label: "Food",
    emoji: "🍽️",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  culture: {
    label: "Culture",
    emoji: "🏛️",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  nature: {
    label: "Nature",
    emoji: "🌿",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  nightlife: {
    label: "Nightlife",
    emoji: "🌙",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-700",
  },
  shopping: {
    label: "Shopping",
    emoji: "🛍️",
    bgColor: "bg-pink-100",
    textColor: "text-pink-700",
  },
  relaxation: {
    label: "Relaxation",
    emoji: "😌",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-700",
  },
  adventure: {
    label: "Adventure",
    emoji: "⛰️",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  photography: {
    label: "Photography",
    emoji: "📸",
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
  },
  romantic: {
    label: "Romantic",
    emoji: "💕",
    bgColor: "bg-rose-100",
    textColor: "text-rose-700",
  },
  family_friendly: {
    label: "Family",
    emoji: "👨‍👩‍👧",
    bgColor: "bg-teal-100",
    textColor: "text-teal-700",
  },
  must_see: {
    label: "Must See",
    emoji: "⭐",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  hidden_gem: {
    label: "Hidden Gem",
    emoji: "💎",
    bgColor: "bg-violet-100",
    textColor: "text-violet-700",
  },
  local_favorite: {
    label: "Local Favorite",
    emoji: "❤️",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
};

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-xs gap-0.5",
  md: "px-2 py-1 text-xs gap-1",
};

export function ActivityTag({
  tag,
  size = "md",
  removable = false,
  onRemove,
}: ActivityTagProps) {
  const config = tagConfig[tag];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium",
        config.bgColor,
        config.textColor,
        sizeClasses[size]
      )}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:bg-black/10 rounded p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
