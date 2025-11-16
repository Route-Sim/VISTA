import { z } from 'zod';

const AgentKind = z.enum(['truck', 'building']);
const TruckAgentData = z.object({
  max_speed_kph: z.number().min(0).optional(),
});
const BuildingAgentData = z.object({});

// Action schemas: exact params per action
export const ActionSchemas = {
  'simulation.start': z.object({ tick_rate: z.number().int().min(1) }),
  'simulation.stop': z.object({}),
  'simulation.resume': z.object({}),
  'simulation.pause': z.object({}),
  'map.create': z
    .object({
      map_width: z.number().positive(),
      map_height: z.number().positive(),
      num_major_centers: z.number().int().min(1),
      minor_per_major: z.number().min(0),
      center_separation: z.number().positive(),
      urban_sprawl: z.number().positive(),
      local_density: z.number().gt(0),
      rural_density: z.number().min(0),
      intra_connectivity: z.number().min(0).max(1),
      inter_connectivity: z.number().min(1),
      arterial_ratio: z.number().min(0).max(1),
      gridness: z.number().min(0).max(1),
      ring_road_prob: z.number().min(0).max(1),
      highway_curviness: z.number().min(0).max(1),
      rural_settlement_prob: z.number().min(0).max(1),
      urban_sites_per_km2: z.number().min(0),
      rural_sites_per_km2: z.number().min(0),
      urban_activity_rate_range: z.tuple([
        z.number().min(0),
        z.number().min(0),
      ]),
      rural_activity_rate_range: z.tuple([
        z.number().min(0),
        z.number().min(0),
      ]),
      seed: z.number().int(),
    })
    .strict(),
  'tick_rate.update': z.object({ tick_rate: z.number().int().min(1) }),
  'agent.create': z
    .object({
      agent_id: z.string(),
      agent_kind: AgentKind,
      agent_data: z.union([TruckAgentData, BuildingAgentData]).optional(),
    })
    .catchall(z.unknown()),
  'agent.update': z.object({ agent_id: z.string() }).catchall(z.unknown()),
  'agent.delete': z.object({ agent_id: z.string() }),
  'agent.list': z.object({}),
  'agent.describe': z.object({ agent_id: z.string() }),
} as const;

export type ActionName = keyof typeof ActionSchemas;
export type ActionParams = {
  [K in ActionName]: z.infer<(typeof ActionSchemas)[K]>;
};

// Shared types for signals
const RoadClass = z.enum(['A', 'S', 'GP', 'G', 'Z', 'L', 'D']);
const GraphNode = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
});
const GraphEdge = z.object({
  id: z.string(),
  from_node: z.string(),
  to_node: z.string(),
  length_m: z.number(),
  mode: z.number().int().min(0),
  road_class: RoadClass,
  lanes: z.number().int().min(1),
  max_speed_kph: z.number().min(0),
  weight_limit_kg: z.number().min(0).nullable(),
});

const AgentTags = z.record(z.string(), z.unknown()).default({});

const AgentSignalBase = z.object({
  id: z.string(),
  kind: AgentKind,
  inbox_count: z.number().int().min(0),
  outbox_count: z.number().int().min(0),
  tags: AgentTags,
});

const GraphIndex = z.union([z.string(), z.number()]);

const BuildingAgentSignalData = AgentSignalBase.extend({
  kind: z.literal('building'),
  building: z
    .object({
      id: z.string(),
    })
    .catchall(z.unknown()),
}).catchall(z.unknown());

const TruckAgentSignalData = AgentSignalBase.extend({
  kind: z.literal('truck'),
  max_speed_kph: z.number().min(0),
  current_speed_kph: z.number().min(0),
  current_node: GraphIndex,
  current_edge: GraphIndex.nullable(),
  edge_progress_m: z.number().min(0),
  route: z.array(GraphIndex),
  destination: GraphIndex.nullable(),
  route_start_node: GraphIndex.nullable(),
  route_end_node: GraphIndex.nullable(),
  current_building_id: z.string().nullable(),
}).catchall(z.unknown());

const AgentSignalData = z.union([
  BuildingAgentSignalData,
  TruckAgentSignalData,
]);

// Signal schemas: exact data per signal
export const SignalSchemas = {
  'simulation.started': z.object({ tick_rate: z.number().int().min(1) }),
  'simulation.stopped': z.object({}),
  'simulation.resumed': z.object({}),
  'simulation.paused': z.object({}),
  'tick.start': z.object({ tick: z.number().int().min(0) }),
  'tick.end': z.object({ tick: z.number().int().min(0) }),
  'map.created': z
    .object({
      // echo of creation params
      map_width: z.number().positive(),
      map_height: z.number().positive(),
      num_major_centers: z.number().int().min(1),
      minor_per_major: z.number().min(0),
      center_separation: z.number().positive(),
      urban_sprawl: z.number().positive(),
      local_density: z.number().gt(0),
      rural_density: z.number().min(0),
      intra_connectivity: z.number().min(0).max(1),
      inter_connectivity: z.number().min(1),
      arterial_ratio: z.number().min(0).max(1),
      gridness: z.number().min(0).max(1),
      ring_road_prob: z.number().min(0).max(1),
      highway_curviness: z.number().min(0).max(1),
      rural_settlement_prob: z.number().min(0).max(1),
      urban_sites_per_km2: z.number().min(0),
      rural_sites_per_km2: z.number().min(0),
      urban_activity_rate_range: z.tuple([
        z.number().min(0),
        z.number().min(0),
      ]),
      rural_activity_rate_range: z.tuple([
        z.number().min(0),
        z.number().min(0),
      ]),
      seed: z.number().int(),
      // generation summary + graph
      generated_nodes: z.number().int().min(0),
      generated_edges: z.number().int().min(0),
      generated_sites: z.number().int().min(0),
      graph: z.object({
        nodes: z.array(GraphNode),
        edges: z.array(GraphEdge),
      }),
    })
    .strict(),
  'tick_rate.updated': z.object({ tick_rate: z.number().int().min(1) }),
  'agent.created': AgentSignalData,
  'agent.updated': z.object({ agent_id: z.string() }).catchall(z.unknown()),
  'agent.deleted': z.object({ agent_id: z.string() }),
  'agent.listed': z.object({
    total: z.number().int().min(0),
    agents: z.array(AgentSignalData),
    tick: z.number().int().min(0),
  }),
  'agent.described': AgentSignalData,
  'building.updated': z
    .object({ building_id: z.string() })
    .catchall(z.unknown()),
  error: z.object({ code: z.string(), message: z.string() }),
} as const;

export type SignalName = keyof typeof SignalSchemas;
export type SignalData = {
  [K in SignalName]: z.infer<(typeof SignalSchemas)[K]>;
};

export type ActionEnvelopeOf<A extends ActionName> = {
  action: A;
  params: ActionParams[A];
  request_id?: string;
};

export type SignalEnvelopeOf<S extends SignalName> = {
  signal: S;
  data: SignalData[S];
  request_id?: string;
};

export type ActionUnion = {
  [K in ActionName]: ActionEnvelopeOf<K>;
}[ActionName];

export type SignalUnion = {
  [K in SignalName]: SignalEnvelopeOf<K>;
}[SignalName];

// Runtime envelope unions for decoding/validation
const ActionEnvelopeUnion = (() => {
  const variants = Object.entries(ActionSchemas).map(([name, schema]) =>
    z.object({
      action: z.literal(name as ActionName),
      params: schema as z.ZodTypeAny,
      request_id: z.string().optional(),
    }),
  );
  return z.union(
    variants as unknown as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]],
  );
})();

const SignalEnvelopeUnion = (() => {
  const variants = Object.entries(SignalSchemas).map(([name, schema]) =>
    z.object({
      signal: z.literal(name as SignalName),
      data: schema as z.ZodTypeAny,
      request_id: z.string().optional(),
    }),
  );
  return z.union(
    variants as unknown as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]],
  );
})();

export function decodeSignal(raw: unknown): SignalUnion {
  return SignalEnvelopeUnion.parse(raw) as SignalUnion;
}

export function decodeAction(raw: unknown): ActionUnion {
  return ActionEnvelopeUnion.parse(raw) as ActionUnion;
}

export function encodeAction<A extends ActionName>(
  action: A,
  params: ActionParams[A],
  requestId?: string,
): ActionEnvelopeOf<A> {
  return { action, params, request_id: requestId };
}
