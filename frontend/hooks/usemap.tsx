"use client";

import { useCallback, useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import streetStyle from "@/lib/mapStyle/streetStyles";
import satelliteStyle from "@/lib/mapStyle/satelliteStyle";
import { drawStyle } from "@/lib/mapUtils";
import { addPredictionRasterLayer } from "@/lib/predictionLayer";
import { useMapStore } from "@/store";

// Make Mapbox Draw compatible with MapLibre
const classes = MapboxDraw.constants.classes as Record<string, string>;

classes.CANVAS = "maplibregl-canvas";
classes.CONTROL_BASE = "maplibregl-ctrl";
classes.CONTROL_PREFIX = "maplibregl-ctrl-";
classes.CONTROL_GROUP = "maplibregl-ctrl-group";
classes.ATTRIBUTION = "maplibregl-ctrl-attrib";

type DrawEvent = "draw.create" | "draw.update" | "draw.delete";

export function useMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const setPolygon = useMapStore((s) => s.setPolygon);
  const setStep = useMapStore((s) => s.setStep);

  const setMap = useMapStore((s) => s.setMap);
  const setDraw = useMapStore((s) => s.setDraw);
  const setPredictionLayerReady = useMapStore(
    (s) => s.setPredictionLayerReady,
  );
  const draw = useMapStore((s) => s.draw);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Do not expose the map center and zoom level in the URL fragment.
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: streetStyle,
      center: [51.388973, 35.689198],
      zoom: 9,
      hash: false,
      attributionControl: false,
    });

    mapRef.current = map;
    setMap(map);

    map.addControl(new maplibregl.NavigationControl(), "top-left");
    map.addControl(new maplibregl.FullscreenControl(), "top-left");

    map.on("load", () => {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        styles: drawStyle,
      });

      map.addControl(draw as any, "top-left");

      setDraw(draw);

      map.on("draw.create" as DrawEvent, () => {
        const data = draw.getAll();

        if (data.features.length > 1) {
          const latest = data.features[data.features.length - 1];

          draw.deleteAll();
          draw.add(latest);
        }

        const feature = draw.getAll().features[0];

        if (feature) {
          setPolygon(feature as never);
          setStep("date");
        }
      });

      map.on("draw.update" as DrawEvent, () => {
        const feature = draw.getAll().features[0];

        setPolygon(feature as never);
      });

      map.on("draw.delete" as DrawEvent, () => {
        setPolygon(null);
        setStep("draw");
      });
    });

    return () => {
      map.remove();

      mapRef.current = null;

      setMap(null);
      setDraw(null);
    };
  }, [setDraw, setMap, setPolygon, setStep]);

  const setMapStyle = useCallback(
    (style: "street" | "satellite") => {
      const map = mapRef.current;
      if (!map) return;

      map.setStyle(
        style === "street" ? streetStyle : satelliteStyle,
      );

      map.once("style.load", () => {
        const {
          predictionLayerInfo,
          soilMoistureVisible,
        } = useMapStore.getState();

        if (predictionLayerInfo) {
          const layerAdded = addPredictionRasterLayer(
            map,
            predictionLayerInfo,
            soilMoistureVisible,
          );
          setPredictionLayerReady(layerAdded);
        }

        if (draw) {
          try {
            map.addControl(draw as any, "top-left");
          } catch (error) {
            console.warn("MapboxDraw could not be restored after style change", error);
          }
        }
      });
    },
    [draw, setPredictionLayerReady],
  );

  return {
    mapContainerRef,
    map: mapRef,
    setMapStyle,
  };
}
