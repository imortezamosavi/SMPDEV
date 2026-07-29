"use client";

import { format } from "date-fns";
import bbox from "@turf/bbox";
import {
  CalendarDays,
  CircleCheckBig,
  Map,
  Droplets,
  Globe,
  Type,
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
