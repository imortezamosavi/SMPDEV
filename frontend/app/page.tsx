"use client";

import { useState } from "react";

import { useMap } from "@/hooks/usemap";
import { MapStyleSwitcher } from "@/components/map-style-switcher";

export default function HomePage() {
  const { mapContainerRef, setMapStyle } = useMap();

  const [style, setStyle] = useState<MapStyle>("street");

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
    </div>
  );
}
