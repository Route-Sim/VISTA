import { HudContent } from './hub-content';
import { Card, CardContent } from '../ui/card';

export function HudFrame() {
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[9999] max-w-[320px]">
      <Card
        role="note"
        aria-label="Camera controls help"
        className="pointer-events-none rounded-[10px] border border-black/10 bg-white/92 font-sans text-[13px] text-black shadow-lg backdrop-blur-[2px]"
      >
        <CardContent className="px-3 py-2.5">
          <HudContent />
        </CardContent>
      </Card>
    </div>
  );
}
