"use client";

import { useState } from "react";

import { useMap } from "@/hooks/usemap";
import { MapStyleSwitcher } from "@/components/map-style-switcher";

export default function HomePage() {
  const { mapContainerRef, setMapStyle } = useMap();

  const [style, setStyle] = useState<MapStyle>("street");

  const testAPI = async () => {
    try {
      const response = await fetch("http://localhost:8000/save-polygon/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          polygon: [
            [
              [51.38, 35.68],
              [51.4, 35.68],
              [51.4, 35.7],
              [51.38, 35.7],
              [51.38, 35.68],
            ],
          ],
          date: "2025-01-15",
        }),
      });

      const data = await response.json();

      console.log("API response:", data);
    } catch (error) {
      console.error("API error:", error);
    }
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />

      <MapStyleSwitcher
        value={style}
        onChange={(value) => {
          setStyle(value);
          setMapStyle(value);
        }}
      />

      <button
        onClick={testAPI}
        className="absolute top-4 right-[500x] z-10 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Test Django API
      </button>
    </div>
  );
}
