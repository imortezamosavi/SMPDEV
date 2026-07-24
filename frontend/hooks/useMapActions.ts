"use client";

import { useCallback } from "react";
import { useMapStore } from "@/store";

export function useMapActions() {
  const draw = useMapStore((s) => s.draw);

  const startDrawing = useCallback(() => {
    draw?.changeMode("draw_polygon");
  }, [draw]);

  const deletePolygon = useCallback(() => {
    draw?.deleteAll();
  }, [draw]);

  const getPolygon = useCallback(() => {
    const data = draw?.getAll();

    if (!data?.features.length) {
      return null;
    }

    return data.features[0];
  }, [draw]);

  return {
    startDrawing,
    deletePolygon,
    getPolygon,
  };
}
