import * as React from 'react';
import { HudContainer } from '@/hud/components/hud-container';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/hud/ui/select';
import { net } from '@/net';
import type { SignalData } from '@/net/protocol/schema';

// We can reuse the agent signal data type
type AgentData = SignalData['agent.described'];

export function AgentInspector(): React.ReactNode {
  const [agents, setAgents] = React.useState<AgentData[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>('');
  const [detail, setDetail] = React.useState<AgentData | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Refresh the agent list
  const refreshList = React.useCallback(async () => {
    try {
      const res = await net.sendAction('agent.list', {});
      if (res.signal === 'agent.listed') {
        setAgents(res.data.agents);
      }
    } catch (err) {
      console.error('Failed to list agents:', err);
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    refreshList();
    // Optional: poll for updates or listen to events if needed
  }, [refreshList]);

  // Fetch details when selection changes
  React.useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    let active = true;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await net.sendAction('agent.describe', {
          agent_id: selectedId,
        });
        if (active && res.signal === 'agent.described') {
          setDetail(res.data);
        } else if (active && res.signal === 'error') {
          console.warn('Agent describe error:', res.data);
          setDetail(null);
        }
      } catch (err) {
        console.error('Failed to describe agent:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      active = false;
    };
  }, [selectedId]);

  return (
    <HudContainer
      id="agent-inspector"
      title="Agent Inspector"
      className="flex w-[320px] flex-col"
    >
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex gap-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.kind} {a.id.slice(0, 8)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            className="rounded border bg-white/50 px-2 text-xs hover:bg-white/80"
            onClick={refreshList}
            title="Refresh list"
          >
            ↻
          </button>
        </div>

        <div className="min-h-[100px] rounded bg-black/5 p-2 text-xs">
          {loading ? (
            <div className="text-black/50 italic">Loading...</div>
          ) : detail ? (
            <pre className="break-words whitespace-pre-wrap">
              {JSON.stringify(detail, null, 2)}
            </pre>
          ) : (
            <div className="text-black/50 italic">
              {selectedId ? 'No data' : 'Select an agent to inspect'}
            </div>
          )}
        </div>
      </div>
    </HudContainer>
  );
}
