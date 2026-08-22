"use client";

import { format } from "date-fns";
import type { Feature, Polygon } from "geojson";
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
import { useState } from "react";
import { AppSidebarHeader } from "./sidebar/SidebarHeader";
import { Legend } from "./Legend";
import { Layers } from "./sidebar/Layers";
import { addPredictionRasterLayer } from "@/lib/predictionLayer";

function getPolygonBounds(
  polygon: Feature<Polygon>,
): [[number, number], [number, number]] {
  const coordinates = polygon.geometry.coordinates[0] as [number, number][];

  const bounds = coordinates.reduce(
    ([minLng, minLat, maxLng, maxLat], [lng, lat]) => [
      Math.min(minLng, lng),
      Math.min(minLat, lat),
      Math.max(maxLng, lng),
      Math.max(maxLat, lat),
    ],
    [Infinity, Infinity, -Infinity, -Infinity],
  );

  return [
    [bounds[0], bounds[1]],
    [bounds[2], bounds[3]],
  ];
}

export function AppSidebar() {
  const { startDrawing } = useMapActions();
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const polygon = useMapStore((s) => s.polygon);
  const selectedDate = useMapStore((s) => s.selectedDate);
  const map = useMapStore((s) => s.map);
  const soilMoistureVisible = useMapStore((s) => s.soilMoistureVisible);

  const setSelectedDate = useMapStore((s) => s.setSelectedDate);
  const setPredictionLayerInfo = useMapStore(
    (s) => s.setPredictionLayerInfo,
  );
  const setPredictionLayerReady = useMapStore(
    (s) => s.setPredictionLayerReady,
  );

  const isPolygonCreated = !!polygon;

  const handleGenerateMap = async () => {
    if (!polygon || !selectedDate || !map) return;

    setIsGenerating(true);
    setError(null);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

      const response = await fetch(`${backendUrl}/save-polygon/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          polygon: polygon.geometry.coordinates[0],
          date: format(selectedDate, "yyyy-MM-dd"),
        }),
      });

      const payload = (await response.json()) as {
        layer_info?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "Failed to generate prediction",
        );
      }

      if (!payload.layer_info) {
        throw new Error("The backend did not return a GeoServer layer.");
      }

      const layerInfo = payload.layer_info;
      setPredictionLayerInfo(layerInfo);
      setPredictionLayerReady(false);

      const addPredictionLayer = () => {
        if (!map.isStyleLoaded()) {
          map.once("style.load", addPredictionLayer);
          return;
        }

        const layerAdded = addPredictionRasterLayer(
          map,
          layerInfo,
          soilMoistureVisible,
        );
        setPredictionLayerReady(layerAdded);

        map.fitBounds(getPolygonBounds(polygon), {
          padding: 50,
          maxZoom: 16,
          duration: 800,
        });
      };

      addPredictionLayer();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to generate map",
      );
    } finally {
      setIsGenerating(false);
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
                  disabled={!polygon || !selectedDate || isGenerating}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGenerating ? "Generating..." : "Generate Map"}
                </Button>

                {error && (
                  <p className="text-xs text-destructive" role="alert">
                    {error}
                  </p>
                )}
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
