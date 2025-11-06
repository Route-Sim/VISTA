---
title: 'Protocol Schemas – Actions & Signals'
summary: 'Strongly typed zod schemas and TypeScript unions for actions and signals, with envelope types and codec helpers.'
source_paths:
  - 'src/net/protocol/schema.ts'
last_updated: '2025-11-03'
owner: 'Mateusz Nędzi'
tags: ['module', 'net', 'protocol', 'zod']
links:
  parent: '../../../SUMMARY.md'
  siblings: ['./mapping.md']
---

# protocol/schema

> Purpose: Define the protocol contract at the edge. Every inbound signal is validated via zod; outbound actions are constructed from typed helpers to ensure correctness.

## Responsibilities & Boundaries

- In-scope: Actions and signals schemas, envelope types, and codec helpers.
- Out-of-scope: Transport, reconnection policy, request tracking.

## Key Types

```ts
type ActionName =
  | 'simulation.start'
  | 'simulation.stop'
  | 'simulation.resume'
  | 'simulation.pause'
  | 'map.create'
  | 'map.export'
  | 'map.import'
  | 'tick_rate.update'
  | 'agent.create'
  | 'agent.update'
  | 'agent.delete'
  | 'agent.get';

type SignalName =
  | 'simulation.started'
  | 'simulation.stopped'
  | 'simulation.resumed'
  | 'simulation.paused'
  | 'map.created'
  | 'map.exported'
  | 'map.imported'
  | 'tick_rate.updated'
  | 'agent.created'
  | 'agent.updated'
  | 'agent.deleted'
  | 'agent.state'
  | 'event.created'
  | 'building.updated'
  | 'error';
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

## Action: map.create

Parameters (validated strictly):

```ts
{
  map_width: number (>0),
  map_height: number (>0),
  num_major_centers: integer (>=1),
  minor_per_major: number (>=0),
  center_separation: number (>0),
  urban_sprawl: number (>0),
  local_density: number (>0),
  rural_density: number (>=0),
  intra_connectivity: number (0..1),
  inter_connectivity: number (>=1),
  arterial_ratio: number (0..1),
  gridness: number (0..1),
  ring_road_prob: number (0..1),
  highway_curviness: number (0..1),
  rural_settlement_prob: number (0..1),
  seed: integer
}
```

Expected response signal: `map.created` with empty data `{}` (statistics TBD).

## References

- Mapping: [`./mapping`](./mapping.md)
- Client: [`../../client`](../../client.md)
