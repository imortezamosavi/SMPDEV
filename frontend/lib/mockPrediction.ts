import type { FeatureCollection, Polygon } from "geojson";

export const mockPrediction: FeatureCollection<Polygon> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        moisture: 75,
        date: "2026-07-24",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [51.35, 35.68],
            [51.45, 35.68],
            [51.45, 35.75],
            [51.35, 35.75],
            [51.35, 35.68],
          ],
        ],
      },
    },
  ],
};
