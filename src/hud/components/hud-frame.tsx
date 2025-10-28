import { HudContent } from "./hub-content";
import { Card, CardContent } from "../ui/card";


export function HudFrame() {
  return (
    <div className="fixed left-4 bottom-4 z-[9999] max-w-[320px] pointer-events-none">
      <Card
        role="note"
        aria-label="Camera controls help"
        className="text-[13px] text-[#3c2f2a] bg-[rgba(255,244,232,0.92)] border border-[rgba(255,171,108,0.6)] rounded-[10px] shadow-[0_4px_14px_rgba(120,70,30,0.15)] backdrop-blur-[2px] font-sans pointer-events-none"
      >
        <CardContent className="px-3 py-2.5">
          <HudContent />
        </CardContent>
      </Card>
    </div>
  );
}
