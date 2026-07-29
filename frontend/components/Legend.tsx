"use client";

export function Legend() {
  return (
    <div className="rounded-lg border p-4">
      <h4 className="mb-3 text-sm font-medium">Soil Moisture Legend</h4>

      <div className="mb-4 flex h-4 overflow-hidden rounded-full">
        <div className="flex-1 bg-red-600" />
        <div className="flex-1 bg-orange-500" />
        <div className="flex-1 bg-yellow-400" />
        <div className="flex-1 bg-lime-400" />
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-cyan-500" />
        <div className="flex-1 bg-blue-600" />
      </div>

      <div className="space-y-2 text-xs">
        <LegendItem label="0–10%" text="Very Dry" />
        <LegendItem label="10–20%" text="Dry" />
        <LegendItem label="20–30%" text="Moderately Dry" />
        <LegendItem label="30–40%" text="Mild Moisture" />
        <LegendItem label="40–60%" text="Adequate" />
        <LegendItem label="60–80%" text="High Moisture" />
        <LegendItem label="80–100%" text="Saturated" />
      </div>
    </div>
  );
}

function LegendItem({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}
