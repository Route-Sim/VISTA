export type Handler<P> = (payload: P) => void;

export interface IEventBus<M extends Record<string, unknown>> {
  on<K extends keyof M & string>(event: K, handler: Handler<M[K]>): () => void;
  off<K extends keyof M & string>(event: K, handler: Handler<M[K]>): void;
  emit<K extends keyof M & string>(event: K, payload: M[K]): void;
  once<K extends keyof M & string>(
    event: K,
    handler: Handler<M[K]>
  ): () => void;
}

export class EventBus<M extends Record<string, unknown>>
  implements IEventBus<M>
{
  private readonly listeners: Map<string, Set<Handler<unknown>>> = new Map();

  on<K extends keyof M & string>(event: K, handler: Handler<M[K]>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (set as Set<Handler<any>>).add(handler as Handler<any>);
    return () => this.off(event, handler);
  }

  once<K extends keyof M & string>(
    event: K,
    handler: Handler<M[K]>
  ): () => void {
    const off = this.on(event, (payload) => {
      off();
      handler(payload);
    });
    return off;
  }

  off<K extends keyof M & string>(event: K, handler: Handler<M[K]>): void {
    const set = this.listeners.get(event);
    if (!set) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (set as Set<Handler<any>>).delete(handler as Handler<any>);
    if (set.size === 0) this.listeners.delete(event);
  }

  emit<K extends keyof M & string>(event: K, payload: M[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const handler of set as Set<Handler<any>>) {
      handler(payload);
    }
  }
}
