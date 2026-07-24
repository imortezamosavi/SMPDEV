import { Droplets } from "lucide-react";
import { ModeToggle } from "../ModeToggle";

export function AppSidebarHeader() {
  return (
    <div className="border-b px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="
flex h-10 w-10 items-center justify-center 
rounded-xl bg-primary/10
"
          >
            <Droplets className="text-primary" />
          </div>

          <div>
            <h2 className="text-sm font-semibold">Soil Moisture</h2>

            <p className="text-xs text-muted-foreground">
              Satellite Monitoring
            </p>
          </div>
        </div>

        <ModeToggle />
      </div>
    </div>
  );
}
