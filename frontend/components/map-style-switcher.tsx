"use client";

import { Map, Satellite } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MapStyleSwitcherProps {
  value: MapStyle;
  onChange: (style: MapStyle) => void;
}

export function MapStyleSwitcher({ value, onChange }: MapStyleSwitcherProps) {
  return (
    <div className="absolute top-4 right-4 z-20">
      <div className="flex items-center gap-1 rounded-xl border bg-background/90 p-1 shadow-lg backdrop-blur-md">
        <Button
          variant={value === "street" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange("street")}
          className={cn(
            "min-w-27.5 justify-center transition-all",
            value !== "street" && "hover:bg-muted",
          )}
        >
          <Map className="mr-2 size-4" />
          Street
        </Button>

        <Button
          variant={value === "satellite" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange("satellite")}
          className={cn(
            "min-w-27.5 justify-center transition-all",
            value !== "satellite" && "hover:bg-muted",
          )}
        >
          <Satellite className="mr-2 size-4" />
          Satellite
        </Button>
      </div>
    </div>
  );
}
