"use client";

import { Droplets, Globe, Type } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
  return (
    <>
      <Layer
        icon={<Droplets size={16} />}
        title="Soil Moisture"
        defaultChecked
      />

      <Layer
        icon={<Globe size={16} />}
        title="Country Borders"
        defaultChecked
      />

      <Layer icon={<Type size={16} />} title="Labels" />
    </>
  );
}
