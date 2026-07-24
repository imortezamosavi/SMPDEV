import { create } from "zustand";
import type { Feature, Polygon } from "geojson";
import type * as maplibregl from "maplibre-gl";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";

export type WorkflowStep = "draw" | "date";

interface MapStore {
  step: WorkflowStep;

  polygon: Feature<Polygon> | null;

  selectedDate: Date | null;

  map: maplibregl.Map | null;

  draw: MapboxDraw | null;

  setStep: (step: WorkflowStep) => void;

  setPolygon: (polygon: Feature<Polygon> | null) => void;

  setSelectedDate: (date: Date | null) => void;

  setMap: (map: maplibregl.Map | null) => void;

  setDraw: (draw: MapboxDraw | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  step: "draw",

  polygon: null,

  selectedDate: null,

  map: null,

  draw: null,

  setStep: (step) => set({ step }),

  setPolygon: (polygon) => set({ polygon }),

  setSelectedDate: (selectedDate) => set({ selectedDate }),

  setMap: (map) => set({ map }),

  setDraw: (draw) => set({ draw }),
}));
