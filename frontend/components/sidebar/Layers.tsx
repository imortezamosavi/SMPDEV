"use client";

import { Droplets, Globe, Type } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PREDICTION_LAYER_ID } from "@/lib/mapLayers";
import { useMapStore } from "@/store";

function Layer({
  title,
  icon,
  defaultChecked,
}: {
  title: string;
  icon: React.ReactNode;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span>{title}</span>
      </div>

      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

export function Layers() {
  const map = useMapStore((state) => state.map);
  const soilMoistureVisible = useMapStore(
    (state) => state.soilMoistureVisible,
  );
  const predictionLayerInfo = useMapStore(
    (state) => state.predictionLayerInfo,
  );
  const setSoilMoistureVisible = useMapStore(
    (state) => state.setSoilMoistureVisible,
  );

  const handleSoilMoistureChange = (visible: boolean) => {
    setSoilMoistureVisible(visible);

    if (map?.getLayer(PREDICTION_LAYER_ID)) {
      map.setLayoutProperty(
        PREDICTION_LAYER_ID,
        "visibility",
        visible ? "visible" : "none",
      );
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Droplets size={16} />
          <span>Soil Moisture</span>
        </div>

        <Switch
          checked={soilMoistureVisible}
          disabled={!map || !predictionLayerInfo}
          onCheckedChange={handleSoilMoistureChange}
          aria-label="Toggle soil moisture layer"
        />
      </div>

      <Layer
        icon={<Globe size={16} />}
        title="Country Borders"
        defaultChecked
      />

      <Layer icon={<Type size={16} />} title="Labels" />
    </>
  );
}
