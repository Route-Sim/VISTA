import * as React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { useSimStore } from '@/hud/state/sim-context';
import { formatSimulationTime } from '@/sim';

/**
 * A clock HUD component displaying the current simulation day and time.
 * Positioned at the top-center of the screen.
 */
export function SimulationClock(): React.ReactNode {
  const store = useSimStore();
  const [simTime, setSimTime] = React.useState(() => {
    const draft = store.getWorkingDraft();
    return draft.simulationTime;
  });

  React.useEffect(() => {
    const unsubscribe = store.subscribe((snapshot) => {
      setSimTime(snapshot.simulationTime);
    });
    return unsubscribe;
  }, [store]);

  const formattedTime = formatSimulationTime(simTime.time);

  return (
    <div className="pointer-events-auto inline-flex items-center gap-3 rounded-lg border border-black/5 bg-white/90 px-4 py-2 shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-sm">
        <Calendar className="h-4 w-4 text-amber-600" />
        <span className="font-medium text-black/70">Day</span>
        <span className="min-w-[2ch] text-center font-semibold tabular-nums text-black/90">
          {simTime.day}
        </span>
      </div>
      <div className="h-4 w-px bg-black/10" />
      <div className="flex items-center gap-1.5 text-sm">
        <Clock className="h-4 w-4 text-amber-600" />
        <span className="min-w-[5ch] text-center font-semibold tabular-nums text-black/90">
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
