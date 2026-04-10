"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  DndContext,
  useDraggable,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { GripVertical, User } from "lucide-react";

// --- Types ---

interface OrgTile {
  id: string;
  role: string;
  label: string;
  color: TileColor;
  x: number;
  y: number;
}

interface TileColor {
  bg: string;
  border: string;
  text: string;
  accent: string;
  accentLight: string;
  icon: string;
}

interface Connection {
  from: string;
  to: string;
}

// --- Color palette per role ---

const TILE_COLORS: Record<string, TileColor> = {
  "vp-enterprise": {
    bg: "bg-indigo-950/60",
    border: "border-indigo-500",
    text: "text-indigo-100",
    accent: "bg-indigo-500",
    accentLight: "bg-indigo-500/20",
    icon: "text-indigo-400",
  },
  "regional-director": {
    bg: "bg-emerald-950/60",
    border: "border-emerald-500",
    text: "text-emerald-100",
    accent: "bg-emerald-500",
    accentLight: "bg-emerald-500/20",
    icon: "text-emerald-400",
  },
  "account-director-enterprise": {
    bg: "bg-amber-950/60",
    border: "border-amber-500",
    text: "text-amber-100",
    accent: "bg-amber-500",
    accentLight: "bg-amber-500/20",
    icon: "text-amber-400",
  },
  "account-director-emerging": {
    bg: "bg-rose-950/60",
    border: "border-rose-500",
    text: "text-rose-100",
    accent: "bg-rose-500",
    accentLight: "bg-rose-500/20",
    icon: "text-rose-400",
  },
};

// --- Initial tile data with hierarchy layout ---

const INITIAL_TILES: OrgTile[] = [
  {
    id: "vp-enterprise",
    role: "VP Enterprise",
    label: "VP Enterprise",
    color: TILE_COLORS["vp-enterprise"],
    x: 400,
    y: 60,
  },
  {
    id: "regional-director",
    role: "Regional Director",
    label: "Regional Director",
    color: TILE_COLORS["regional-director"],
    x: 400,
    y: 240,
  },
  {
    id: "account-director-enterprise",
    role: "Account Director, Enterprise",
    label: "Account Director, Enterprise",
    color: TILE_COLORS["account-director-enterprise"],
    x: 180,
    y: 420,
  },
  {
    id: "account-director-emerging",
    role: "Account Director, Emerging Enterprise",
    label: "Account Director, Emerging Enterprise",
    color: TILE_COLORS["account-director-emerging"],
    x: 620,
    y: 420,
  },
];

const INITIAL_CONNECTIONS: Connection[] = [
  { from: "vp-enterprise", to: "regional-director" },
  { from: "regional-director", to: "account-director-enterprise" },
  { from: "regional-director", to: "account-director-emerging" },
];

const TILE_WIDTH = 260;
const TILE_HEIGHT = 100;

// --- Draggable Tile Component ---

function DraggableTile({ tile }: { tile: OrgTile }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: tile.id,
    });

  const style: React.CSSProperties = {
    position: "absolute",
    left: tile.x,
    top: tile.y,
    width: TILE_WIDTH,
    zIndex: isDragging ? 50 : 10,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: isDragging ? "none" : "box-shadow 0.2s ease",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className={cn(
          "rounded-xl border-2 p-4 cursor-grab active:cursor-grabbing select-none",
          "backdrop-blur-sm shadow-lg",
          tile.color.bg,
          tile.color.border,
          isDragging && "shadow-2xl ring-2 ring-white/20 scale-105"
        )}
      >
        {/* Accent bar */}
        <div
          className={cn(
            "absolute top-0 left-4 right-4 h-1 rounded-b-full",
            tile.color.accent
          )}
        />

        <div className="flex items-start gap-3">
          {/* Drag handle + icon */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <div
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-white/10 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                tile.color.accentLight
              )}
            >
              <User className={cn("h-4 w-4", tile.color.icon)} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                "text-xs font-semibold uppercase tracking-wider mb-1 opacity-70",
                tile.color.text
              )}
            >
              {"Role"}
            </div>
            <div className={cn("text-sm font-bold leading-tight", tile.color.text)}>
              {tile.label}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Drag to reposition
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SVG Connector Lines ---

function ConnectorLines({
  tiles,
  connections,
}: {
  tiles: OrgTile[];
  connections: Connection[];
}) {
  const tileMap = new Map(tiles.map((t) => [t.id, t]));

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill="hsl(0 0% 40%)"
          />
        </marker>
      </defs>
      {connections.map((conn) => {
        const from = tileMap.get(conn.from);
        const to = tileMap.get(conn.to);
        if (!from || !to) return null;

        const fromX = from.x + TILE_WIDTH / 2;
        const fromY = from.y + TILE_HEIGHT;
        const toX = to.x + TILE_WIDTH / 2;
        const toY = to.y;

        // Curved path
        const midY = (fromY + toY) / 2;

        return (
          <path
            key={`${conn.from}-${conn.to}`}
            d={`M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`}
            fill="none"
            stroke="hsl(0 0% 30%)"
            strokeWidth="2"
            strokeDasharray="6 4"
            markerEnd="url(#arrowhead)"
          />
        );
      })}
    </svg>
  );
}

// --- Grid background ---

function CanvasGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" style={{ zIndex: 1 }}>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

// --- Main Org Chart View ---

export function OrgChartView() {
  const [tiles, setTiles] = useState<OrgTile[]>(INITIAL_TILES);
  const [connections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    setTiles((prev) =>
      prev.map((tile) =>
        tile.id === active.id
          ? {
              ...tile,
              x: Math.max(0, tile.x + delta.x),
              y: Math.max(0, tile.y + delta.y),
            }
          : tile
      )
    );
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card/50 backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-foreground">Team Org Chart</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Drag tiles to rearrange the organization structure
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            {INITIAL_TILES.map((tile) => (
              <div key={tile.id} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-sm", tile.color.accent)} />
                <span className="text-muted-foreground">{tile.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-background">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div
            ref={canvasRef}
            className="relative"
            style={{ minWidth: 1200, minHeight: 700 }}
          >
            <CanvasGrid />
            <ConnectorLines tiles={tiles} connections={connections} />
            {tiles.map((tile) => (
              <DraggableTile key={tile.id} tile={tile} />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
