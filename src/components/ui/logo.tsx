import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Globe className={cn(iconSizes[size], "text-primary")} />
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm" />
      </div>
      {showText && (
        <span className={cn("font-semibold tracking-tight", textSizes[size])}>
          Plan It
        </span>
      )}
    </div>
  );
}
