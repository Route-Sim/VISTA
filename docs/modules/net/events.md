---
title: "Event Bus"
summary: "Minimal typed observer used for internal signalling; supports on/off/once/emit with string keys and payload types."
source_paths:
- "src/net/events.ts"
last_updated: "2025-10-29"
owner: "Mateusz Polis"
tags: ["module", "net", "events"]
links:
  parent: "../../SUMMARY.md"
  siblings: []
---

# events

> Purpose: Provide a lightweight event bus abstraction. The network client primarily uses explicit per-signal subscriptions, but a generic bus is available for composition.

## Public API / Usage

```ts
const bus = new EventBus<{ hello: string }>();
const off = bus.on("hello", (payload) => console.log(payload));
bus.emit("hello", "world");
off();
```

## Implementation Notes

- Handlers are stored per event key in `Set`s; `once` auto-unsubscribes.
- Designed to be minimal and allocation-conscious.

## References

- Client: [`./client`](./client.md)


