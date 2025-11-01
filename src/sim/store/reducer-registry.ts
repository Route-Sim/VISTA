import type { SimEvent, SimEventType } from '../events';
import type { SimDraft } from './snapshot';

export type Reducer<E extends SimEvent = SimEvent> = (
  draft: SimDraft,
  evt: E,
) => void;

export class ReducerRegistry {
  private readonly reducers = new Map<SimEventType, Reducer[]>();

  register<T extends SimEventType>(type: T, reducer: Reducer): void {
    const list = this.reducers.get(type) ?? [];
    list.push(reducer);
    this.reducers.set(type, list);
  }

  dispatch(draft: SimDraft, evt: SimEvent): void {
    const list = this.reducers.get(evt.type);
    if (!list || list.length === 0) return;
    for (const r of list) r(draft, evt);
  }
}
