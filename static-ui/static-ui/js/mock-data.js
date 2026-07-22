/* ==========================================================================
   Mock Data
   Static data used to populate the dashboard UI
   ========================================================================== */

const MOCK_DATA = {
  currentDate: "2024-05-15",

  layers: [
    { id: "soil_moisture", name: "Soil Moisture", visible: true },
    { id: "country_borders", name: "Country Borders", visible: true },
    { id: "labels", name: "Labels", visible: false },
  ],

  baseMaps: [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "satellite", label: "Satellite" },
  ],

  selectedBaseMap: "satellite",

  legendItems: [
    { color: "#dc2626", min: 0, max: 10, label: "Very Dry" },
    { color: "#f97316", min: 10, max: 20, label: "Dry" },
    { color: "#eab308", min: 20, max: 30, label: "Moderately Dry" },
    { color: "#84cc16", min: 30, max: 40, label: "Mild Moisture" },
    { color: "#22c55e", min: 40, max: 60, label: "Adequate" },
    { color: "#06b6d4", min: 60, max: 80, label: "High Moisture" },
    { color: "#2563eb", min: 80, max: 100, label: "Saturated" },
  ],

  infoCards: [
    {
      id: "date",
      icon: "calendar",
      iconColor: "green",
      subtitle: "SELECTED DATE",
      title: "May 15, 2024",
    },
    {
      id: "satellite",
      icon: "cpu",
      iconColor: "blue",
      subtitle: "SATELLITE SOURCE",
      title: "Sentinel-1 (C-band)",
    },
    {
      id: "resolution",
      icon: "ruler",
      iconColor: "amber",
      subtitle: "RESOLUTION",
      title: "1 km × 1 km",
    },
    {
      id: "coverage",
      icon: "globe",
      iconColor: "indigo",
      subtitle: "COVERAGE",
      title: "Global (60°N–56°S)",
    },
    {
      id: "validation",
      icon: "check-circle",
      iconColor: "green",
      subtitle: "VALIDATION",
      title: "In-Situ Network (RMSE < 0.05)",
    },
  ],
};
