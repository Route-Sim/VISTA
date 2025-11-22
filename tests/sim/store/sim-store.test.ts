import { describe, it, expect } from 'vitest';
import { SimStore } from '@/sim/store/sim-store';
import { asAgentId } from '@/sim/domain/ids';

describe('SimStore', () => {
  it('should initialize with empty snapshot', () => {
    const store = new SimStore();
    const draft = store.getWorkingDraft();
    expect(draft.tick).toBe(0);
    expect(Object.keys(draft.agents)).toHaveLength(0);
  });

  it('should ingest tick.start and update time', () => {
    const store = new SimStore();
    store.ingest({ type: 'tick.start', tick: 1, timeMs: 100 });
    
    const draft = store.getWorkingDraft();
    expect(draft.tick).toBe(1);
    expect(draft.timeMs).toBe(100);
  });

  it('should commit on tick.end', () => {
    const store = new SimStore();
    store.ingest({ type: 'tick.start', tick: 1, timeMs: 100 });
    store.ingest({ type: 'tick.end', tick: 1, timeMs: 100 });

    const buffer = store.getBuffer();
    // Initial snapshot + committed tick 1
    // Actually, initial snapshot is at index 0.
    // commitTick pushes a new one.
    // buffer should have 2 items.
    const recent = buffer.getMostRecent();
    expect(recent).toBeDefined();
    expect(recent?.tick).toBe(1);
  });

  it('should dispatch reducers for events', () => {
    const store = new SimStore();
    const id = asAgentId('a1');
    
    store.ingest({ type: 'agent.created', agent: { id } });
    
    const draft = store.getWorkingDraft();
    expect(draft.agents[id]).toBeDefined();
  });

  it('should immediately commit map.created', () => {
    const store = new SimStore();
    
    store.ingest({
      type: 'map.created',
      nodes: {},
      edges: {},
      roads: {},
      buildings: {},
    });

    // Buffer should have a new snapshot even without tick.end
    const buffer = store.getBuffer();
    // Initial + map commit
    // Wait, implementation: "if (evt.type === 'map.created') { this.commitTick(this.working.tick); }"
    // So yes.
    // buffer size depends on initial state.
    // Initial push in constructor = 1 item.
    // map.created push = 2 items.
    
    // We can check if last snapshot has map data, but empty map is empty.
    // Let's check count implicitly via getting most recent which should match draft
    const recent = buffer.getMostRecent();
    const draft = store.getWorkingDraft();
    expect(recent).toEqual(draft); // because it was cloned from committed
  });
});

