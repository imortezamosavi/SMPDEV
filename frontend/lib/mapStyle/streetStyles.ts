import type { StyleSpecification } from "maplibre-gl";

const streetStyle: StyleSpecification = {
  version: 8,
  name: "Street",

  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",

  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },

  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#f5f5f5",
      },
    },
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

export default streetStyle;
