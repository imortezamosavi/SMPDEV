import type { Map as MapLibreMap } from "maplibre-gl";

import {
  PREDICTION_LAYER_ID,
  PREDICTION_SOURCE_ID,
} from "@/lib/mapLayers";

export function addPredictionRasterLayer(
  map: MapLibreMap,
  layerInfo: string,
  visible: boolean,
) {
  if (!map.isStyleLoaded()) return false;

  if (map.getLayer(PREDICTION_LAYER_ID)) {
    map.removeLayer(PREDICTION_LAYER_ID);
  }

  if (map.getLayer("prediction-fill")) {
    map.removeLayer("prediction-fill");
  }

  if (map.getSource(PREDICTION_SOURCE_ID)) {
    map.removeSource(PREDICTION_SOURCE_ID);
  }

  const wmsParams = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetMap",
    LAYERS: layerInfo,
    STYLES: "style_1",
    FORMAT: "image/png",
    TRANSPARENT: "true",
    TILED: "true",
    SRS: "EPSG:3857",
    WIDTH: "256",
    HEIGHT: "256",
  });

  map.addSource(PREDICTION_SOURCE_ID, {
    type: "raster",
    tiles: [
      `/geoserver/demo/wms?${wmsParams.toString()}&BBOX={bbox-epsg-3857}`,
    ],
    tileSize: 256,
  });

  map.addLayer({
    id: PREDICTION_LAYER_ID,
    type: "raster",
    source: PREDICTION_SOURCE_ID,
    paint: {
      "raster-opacity": 0.85,
    },
  });

  map.setLayoutProperty(
    PREDICTION_LAYER_ID,
    "visibility",
    visible ? "visible" : "none",
  );

  return true;
}
