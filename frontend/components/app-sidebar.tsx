"use client";

import { format } from "date-fns";
import bbox from "@turf/bbox";
import {
  CalendarDays,
  CircleCheckBig,
  Layers3,
  Map,
  Droplets,
  Globe,
  Type,
  Pencil,
  Sparkles,
} from "lucide-react";

import { useMapActions } from "@/hooks/useMapActions";
import { useMapStore } from "@/store";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { mockPrediction } from "@/lib/mockPrediction";
import { ModeToggle } from "./ModeToggle";

export function AppSidebar() {
  const { startDrawing } = useMapActions();
  const [open, setOpen] = useState(false);

  const polygon = useMapStore((s) => s.polygon);
  const selectedDate = useMapStore((s) => s.selectedDate);
  const map = useMapStore((s) => s.map);

  const setSelectedDate = useMapStore((s) => s.setSelectedDate);

  const isPolygonCreated = !!polygon;

  const handleGenerateMap = () => {
    if (!polygon || !selectedDate || !map) {
      console.warn("Missing data");
      return;
    }

    const sourceId = "prediction-layer";
    const layerId = "prediction-fill";

    if (map.getSource(sourceId)) {
      map.removeLayer(layerId);
      map.removeSource(sourceId);
    }

    map.addSource(sourceId, {
      type: "geojson",
      data: mockPrediction,
    });

    map.addLayer({
      id: layerId,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": "#22c55e",
        "fill-opacity": 0.5,
      },
    });

    const bounds = bbox(mockPrediction);

    map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      {
        padding: 50,
        duration: 1000,
      },
    );

    console.log("Prediction displayed");
  };

  return (
    <Sidebar
      className="border-r bg-background flex flex-col"
      collapsible="icon"
    >
      {" "}
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Droplets className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="text-sm font-semibold leading-none">
                Soil Moisture
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Satellite Monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ModeToggle />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Accordion defaultValue={["workflow"]}>
          <AccordionItem value="workflow">
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2">
                <Map size={18} />
                Workflow
              </div>
            </AccordionTrigger>

            <AccordionContent className="space-y-6 px-4">
              {/* STEP 1 */}

              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Draw Area</h4>

                  {isPolygonCreated && (
                    <Badge variant="secondary" className="gap-1">
                      <CircleCheckBig className="h-3.5 w-3.5" />
                      Done
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Draw the Area of Interest (AOI) on the map.
                </p>

                <Button onClick={startDrawing} className="w-full">
                  <Pencil className="mr-2 h-4 w-4" />
                  Draw Polygon
                </Button>
              </div>

              {/* STEP 2 */}

              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Select Date</h4>

                  {selectedDate && (
                    <Badge variant="secondary" className="gap-1">
                      <CircleCheckBig className="h-3.5 w-3.5" />
                      Done
                    </Badge>
                  )}
                </div>

                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      disabled={!isPolygonCreated}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />

                      {selectedDate
                        ? format(selectedDate, "PPP")
                        : "Choose date"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate ?? undefined}
                      onSelect={(date) => {
                        if (!date) return;

                        setSelectedDate(date);
                        setOpen(false); // close popover
                      }}
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  onClick={handleGenerateMap}
                  className="w-full"
                  disabled={!polygon || !selectedDate}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Map
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Layers */}

          <AccordionItem value="layers">
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2">
                <Layers3 size={18} />
                Map Controls
              </div>
            </AccordionTrigger>

            <AccordionContent className="space-y-5 px-4">
              <Layer
                icon={<Droplets size={16} />}
                title="Soil Moisture"
                defaultChecked
              />

              <Layer
                icon={<Globe size={16} />}
                title="Country Borders"
                defaultChecked
              />

              <Layer icon={<Type size={16} />} title="Labels" />
            </AccordionContent>
          </AccordionItem>

          {/* Legend */}

          <div className="rounded-lg border p-4">
            <h4 className="mb-3 text-sm font-medium">Soil Moisture Legend</h4>

            <div className="mb-4 flex h-4 overflow-hidden rounded-full">
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-orange-500" />
              <div className="flex-1 bg-yellow-400" />
              <div className="flex-1 bg-lime-400" />
              <div className="flex-1 bg-green-500" />
              <div className="flex-1 bg-cyan-500" />
              <div className="flex-1 bg-blue-600" />
            </div>

            <div className="space-y-2 text-xs">
              <Legend label="0–10%" text="Very Dry" />
              <Legend label="10–20%" text="Dry" />
              <Legend label="20–30%" text="Moderately Dry" />
              <Legend label="30–40%" text="Mild Moisture" />
              <Legend label="40–60%" text="Adequate" />
              <Legend label="60–80%" text="High Moisture" />
              <Legend label="80–100%" text="Saturated" />
            </div>
          </div>
        </Accordion>
      </SidebarContent>
    </Sidebar>
  );
}

function Layer({
  title,
  icon,
  defaultChecked,
}: {
  title: string;
  icon: React.ReactNode;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span>{title}</span>
      </div>

      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function Legend({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}
