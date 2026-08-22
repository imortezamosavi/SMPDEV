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

  predictionLayerInfo: string | null;

  soilMoistureVisible: boolean;

  predictionLayerReady: boolean;

  setStep: (step: WorkflowStep) => void;

  setPolygon: (polygon: Feature<Polygon> | null) => void;

  setSelectedDate: (date: Date | null) => void;

  setMap: (map: maplibregl.Map | null) => void;

  setDraw: (draw: MapboxDraw | null) => void;

  setPredictionLayerInfo: (layerInfo: string | null) => void;

  setSoilMoistureVisible: (visible: boolean) => void;

  setPredictionLayerReady: (ready: boolean) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  step: "draw",

  polygon: null,

  selectedDate: null,

  map: null,

  draw: null,

  predictionLayerInfo: null,

  soilMoistureVisible: true,

  predictionLayerReady: false,

  setStep: (step) => set({ step }),

  setPolygon: (polygon) => set({ polygon }),

  setSelectedDate: (selectedDate) => set({ selectedDate }),

  setMap: (map) => set({ map }),

  setDraw: (draw) => set({ draw }),

  setPredictionLayerInfo: (predictionLayerInfo) =>
    set({ predictionLayerInfo }),

  setSoilMoistureVisible: (soilMoistureVisible) =>
    set({ soilMoistureVisible }),

  setPredictionLayerReady: (predictionLayerReady) =>
    set({ predictionLayerReady }),
}));
