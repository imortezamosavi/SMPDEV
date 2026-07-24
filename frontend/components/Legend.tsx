export function Legend() {
  const values = [
    ["0–10%", "Very Dry"],
    ["10–20%", "Dry"],
    ["20–30%", "Moderately Dry"],
    ["30–40%", "Mild Moisture"],
    ["40–60%", "Adequate"],
    ["60–80%", "High Moisture"],
    ["80–100%", "Saturated"],
  ];

  return (
    <div className="rounded-lg border p-4">
      <h4 className="mb-3 text-sm font-medium">Soil Moisture Legend</h4>

      <div className="mb-4 flex h-4 overflow-hidden rounded-full">
        {["red", "orange", "yellow", "lime", "green", "cyan", "blue"].map(
          (c) => (
            <div key={c} className={`flex-1 bg-${c}-500`} />
          ),
        )}
      </div>

      <div className="space-y-2 text-xs">
        {values.map(([a, b]) => (
          <div className="flex justify-between" key={a}>
            <span>{a}</span>
            <span className="text-muted-foreground">{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
