/* ==========================================================================
   Map Module
   Placeholder for future OpenLayers + GeoServer WMS integration.

   When ready, initialize OpenLayers here:
     import Map from 'ol/Map.js';
     import View from 'ol/View.js';
     import TileLayer from 'ol/layer/Tile.js';
     import OSM from 'ol/source/OSM.js';
     import TileWMS from 'ol/source/TileWMS.js';

   const map = new Map({
     target: 'map',
     layers: [ ... ],
     view: new View({ center: [0, 20], zoom: 2 }),
   });
   ========================================================================== */

const MapModule = (() => {
  function init() {
    console.log("[MapModule] Map container initialized. Waiting for OpenLayers integration.");

    const mapEl = document.getElementById("map");
    if (!mapEl) {
      console.warn("[MapModule] #map element not found.");
      return;
    }

    // Placeholder visual: show a gradient background in the map area
    // This will be replaced by OpenLayers tile layers
    mapEl.style.background =
      "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)";
    mapEl.style.display = "flex";
    mapEl.style.alignItems = "center";
    mapEl.style.justifyContent = "center";
    mapEl.style.color = "#64748b";
    mapEl.style.fontSize = "0.875rem";
    mapEl.style.fontWeight = "600";

    const placeholderMsg = document.createElement("span");
    placeholderMsg.textContent = "Map — OpenLayers + GeoServer WMS will initialize here";
    mapEl.appendChild(placeholderMsg);
  }

  function destroy() {
    const mapEl = document.getElementById("map");
    if (mapEl) {
      mapEl.innerHTML = "";
      mapEl.style.background = "";
      mapEl.style.display = "";
      mapEl.style.alignItems = "";
      mapEl.style.justifyContent = "";
      mapEl.style.color = "";
      mapEl.style.fontSize = "";
      mapEl.style.fontWeight = "";
    }
  }

  return { init, destroy };
})();
