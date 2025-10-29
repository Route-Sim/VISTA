import { HudContent } from './hub-content';
import { Card, CardContent } from '../ui/card';

export function HudFrame() {
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[9999] max-w-[320px]">
      <Card
        role="note"
        aria-label="Camera controls help"
        className="pointer-events-none rounded-[10px] border border-[rgba(255,171,108,0.6)] bg-[rgba(255,244,232,0.92)] font-sans text-[13px] text-[#3c2f2a] shadow-[0_4px_14px_rgba(120,70,30,0.15)] backdrop-blur-[2px]"
      >
        <CardContent className="px-3 py-2.5">
          <HudContent />
        </CardContent>
      </Card>
    </div>
  );
}
