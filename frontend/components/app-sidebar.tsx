"use client";

import { format } from "date-fns";
import {
  CalendarDays,
  CircleCheckBig,
  Map,
  Pencil,
  Sparkles,
  Layers3,
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
import { AppSidebarHeader } from "./sidebar/SidebarHeader";
import { Legend } from "./Legend";
import { Layers } from "./sidebar/Layers";

export function AppSidebar() {
  const { startDrawing } = useMapActions();
  const [open, setOpen] = useState(false);

  const polygon = useMapStore((s) => s.polygon);
  const selectedDate = useMapStore((s) => s.selectedDate);
  const map = useMapStore((s) => s.map);

  const setSelectedDate = useMapStore((s) => s.setSelectedDate);

  const isPolygonCreated = !!polygon;

  const handleGenerateMap = async () => {
    if (!polygon || !selectedDate || !map) return;

    try {
      const response = await fetch(`${`http://localhost:8000`}/save-polygon/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          polygon: polygon.geometry.coordinates[0],
          date: format(selectedDate, "yyyy-MM-dd"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate prediction");
      }

      const geojson = await response.json();

      // remove old layer
      if (map.getSource("prediction-layer")) {
        map.removeLayer("prediction-fill");
        map.removeSource("prediction-layer");
      }

      // add new prediction
      map.addSource("prediction-layer", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "prediction-fill",
        type: "fill",
        source: "prediction-layer",
        paint: {
          "fill-color": "#22c55e",
          "fill-opacity": 0.5,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Sidebar
      className="border-r bg-background flex flex-col"
      collapsible="icon"
    >
      <SidebarHeader className="border-b px-4 py-4">
        <AppSidebarHeader />
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
                  Draw the Area of Interest on the map.
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
                  <PopoverTrigger
                    className="w-full"
                    render={
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        disabled={!isPolygonCreated}
                      />
                    }
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />

                    {selectedDate ? format(selectedDate, "PPP") : "Choose date"}
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate ?? undefined}
                      onSelect={(date) => {
                        if (!date) return;

                        setSelectedDate(date);
                        setOpen(false);
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

          <AccordionItem value="layers">
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2">
                <Layers3 size={18} />
                Map Controls
              </div>
            </AccordionTrigger>

            <AccordionContent className="space-y-5 px-4">
              <Layers />
            </AccordionContent>
          </AccordionItem>

          <Legend />
        </Accordion>
      </SidebarContent>
    </Sidebar>
  );
}
