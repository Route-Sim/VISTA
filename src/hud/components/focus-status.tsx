import { useFocusState } from '@/hud/state/focus-state';
import { Button } from '@/hud/ui/button';
import { Card, CardContent } from '@/hud/ui/card';
import { X } from 'lucide-react';

export function FocusStatus() {
  const { focusedId, focusedType, clearFocus } = useFocusState();

  if (!focusedId || !focusedType) return null;

  return (
    <div className="pointer-events-auto">
      <Card className="rounded-full border border-black/10 bg-white/90 shadow-lg backdrop-blur-sm">
        <CardContent className="flex items-center gap-3 p-2 pl-4">
          <span className="text-sm font-medium text-black/80">
            Focusing {focusedType}:{' '}
            <span className="font-bold">{focusedId}</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-black/5"
            onClick={clearFocus}
            title="Unfocus"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
