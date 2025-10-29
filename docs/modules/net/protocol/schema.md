---
title: "Protocol Schemas – Actions & Signals"
summary: "Strongly typed zod schemas and TypeScript unions for actions and signals, with envelope types and codec helpers."
source_paths:
- "src/net/protocol/schema.ts"
last_updated: "2025-10-29"
owner: "Mateusz Polis"
tags: ["module", "net", "protocol", "zod"]
links:
  parent: "../../../SUMMARY.md"
  siblings: ["./mapping.md"]
---

# protocol/schema

> Purpose: Define the protocol contract at the edge. Every inbound signal is validated via zod; outbound actions are constructed from typed helpers to ensure correctness.

## Responsibilities & Boundaries

- In-scope: Actions and signals schemas, envelope types, and codec helpers.
- Out-of-scope: Transport, reconnection policy, request tracking.

## Key Types

```ts
type ActionName =
  | "simulation.start" | "simulation.stop" | "simulation.resume"
  | "map.create" | "map.export" | "map.import"
  | "tick_rate.update"
  | "agent.create" | "agent.update" | "agent.delete" | "agent.get";

type SignalName =
  | "simulation.started" | "simulation.stopped" | "simulation.resumed"
  | "map.created" | "map.exported" | "map.imported"
  | "tick_rate.updated"
  | "agent.created" | "agent.updated" | "agent.deleted" | "agent.state"
  | "event.created" | "error";
```

## Envelopes

```ts
type ActionEnvelopeOf<A extends ActionName> = {
  action: A;
  params: ActionParams[A];
  request_id?: string;
};

type SignalEnvelopeOf<S extends SignalName> = {
  signal: S;
  data: SignalData[S];
  request_id?: string;
};
```

## Codec Helpers

```ts
decodeSignal(raw: unknown): SignalUnion
decodeAction(raw: unknown): ActionUnion
encodeAction(action: ActionName, params: ActionParams[ActionName], requestId?: string): ActionEnvelopeOf<ActionName>
```

## Implementation Notes

- `.catchall(z.unknown())` is used sparingly where extensibility is expected.
- Discriminated unions are constructed programmatically from schema maps to avoid drift.

## References

- Mapping: [`./mapping`](./mapping.md)
- Client: [`../../client`](../../client.md)


