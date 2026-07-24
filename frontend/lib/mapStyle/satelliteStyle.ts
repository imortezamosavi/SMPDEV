import type { StyleSpecification } from "maplibre-gl";

const satelliteStyle: StyleSpecification = {
  version: 8,
  name: "Satellite",
  sources: {
    "wms-google-source": {
      type: "raster",
      // url: "mapbox://mapbox.satellite",
      tiles: ["https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "wms-google-layer",
      source: "wms-google-source",
      type: "raster",
      paint: {},
    },
  ],
};

export default satelliteStyle;
