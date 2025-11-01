import * as React from 'react';
import { HudContainer } from '@/hud/components/hud-container';
import { Button } from '@/hud/ui/button';
import { Separator } from '@/hud/ui/separator';
import { netTelemetry, type NetTelemetryEvent } from '@/net/telemetry';

type FilterState = {
  in: boolean;
  out: boolean;
  conn: boolean;
};

type ListItem = {
  id: number;
  e: NetTelemetryEvent;
};

const CAPACITY = 500;

function formatTime(t: number): string {
  const d = new Date(t);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <Button
      variant={active ? 'default' : 'secondary'}
      size="sm"
      className="h-7 px-2"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function Row({ item, expanded, onToggle }: {
  item: ListItem;
  expanded: boolean;
  onToggle: () => void;
}): React.ReactElement {
  const { e } = item;
  const t = formatTime(e.t);
  let badge = '';
  let summary = '';
  let details: string | null = null;

  if (e.dir === 'conn') {
    badge = 'CONN';
    switch (e.kind) {
      case 'connecting':
        summary = 'connecting';
        break;
      case 'open':
        summary = 'open';
        break;
      case 'close':
        summary = 'close';
        details = JSON.stringify(e.info ?? null, null, 2);
        break;
      case 'error':
        summary = 'error';
        details = JSON.stringify(e.info ?? null, null, 2);
        break;
    }
  } else if (e.dir === 'out') {
    badge = 'OUT';
    summary = e.action ? `action ${e.action}` : 'action';
    details = e.text;
  } else {
    // in
    badge = 'IN';
    if (e.kind === 'incoming-signal') {
      summary = `signal ${e.signal.signal}`;
      details = JSON.stringify(e.signal, null, 2);
    } else {
      summary = 'raw';
      details = e.text;
    }
  }

  return (
    <div className="rounded-md border border-black/5 bg-white/80 p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-[10px] font-semibold text-black/60 w-[42px]">{badge}</div>
          <div className="text-[10px] text-black/60 w-[94px]">{t}</div>
          <div className="truncate text-xs text-black/90">{summary}</div>
        </div>
        {details ? (
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onToggle} aria-label="Toggle details">
            {expanded ? 'Hide' : 'Show'}
          </Button>
        ) : null}
      </div>
      {expanded && details ? (
        <div className="mt-2 max-h-40 overflow-auto rounded bg-black/5 p-2">
          <pre className="m-0 whitespace-pre-wrap break-words text-[10px] text-black/80">
            {details}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

export function NetEventsPanel(): React.ReactNode {
  const [filters, setFilters] = React.useState<FilterState>({ in: true, out: true, conn: true });
  const [items, setItems] = React.useState<ListItem[]>([]);
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const seqRef = React.useRef<number>(0);

  const toggleFilter = (k: keyof FilterState) =>
    setFilters((f) => ({ ...f, [k]: !f[k] }));

  React.useEffect(() => {
    const off = netTelemetry.on('event', (e) => {
      const id = ++seqRef.current;
      setItems((prev) => {
        const next = [...prev, { id, e }];
        if (next.length > CAPACITY) next.splice(0, next.length - CAPACITY);
        return next;
      });
    });
    return () => off();
  }, []);

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [items]);

  const clear = () => {
    setItems([]);
    setExpanded({});
  };

  return (
    <HudContainer
      id="net-events"
      title="Net Events"
      className="fixed top-4 left-4 w-[420px]"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Toggle active={filters.in} onClick={() => toggleFilter('in')}>Incoming</Toggle>
            <Toggle active={filters.out} onClick={() => toggleFilter('out')}>Outgoing</Toggle>
            <Toggle active={filters.conn} onClick={() => toggleFilter('conn')}>Conn</Toggle>
          </div>
          <Button variant="outline" size="sm" className="h-7" onClick={clear}>Clear</Button>
        </div>
        <Separator className="bg-black/10" />
        <div ref={listRef} className="max-h-[320px] overflow-auto pr-1">
          <div className="flex flex-col gap-2">
            {items
              .filter(({ e }) => (e.dir === 'in' && filters.in) || (e.dir === 'out' && filters.out) || (e.dir === 'conn' && filters.conn))
              .map((item) => (
                <Row
                  key={item.id}
                  item={item}
                  expanded={!!expanded[item.id]}
                  onToggle={() => setExpanded((m) => ({ ...m, [item.id]: !m[item.id] }))}
                />
              ))}
          </div>
        </div>
      </div>
    </HudContainer>
  );
}


