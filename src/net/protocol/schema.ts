import { z } from 'zod';

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
      seed: z.number().int(),
    })
    .strict(),
  'map.export': z.object({ map_name: z.string() }),
  'map.import': z.object({ base64_file: z.string() }),
  'tick_rate.update': z.object({ tick_rate: z.number().int().min(1) }),
  'agent.create': z
    .object({ agent_id: z.string(), agent_kind: z.string() })
    .catchall(z.unknown()),
  'agent.update': z.object({ agent_id: z.string() }).catchall(z.unknown()),
  'agent.delete': z.object({ agent_id: z.string() }),
  'agent.get': z.object({ agent_id: z.string() }),
} as const;

export type ActionName = keyof typeof ActionSchemas;
export type ActionParams = {
  [K in ActionName]: z.infer<(typeof ActionSchemas)[K]>;
};

// Signal schemas: exact data per signal
export const SignalSchemas = {
  'simulation.started': z.object({ tick_rate: z.number().int().min(1) }),
  'simulation.stopped': z.object({}),
  'simulation.resumed': z.object({}),
  'simulation.paused': z.object({}),
  'map.created': z.object({}),
  'map.exported': z.object({ filename: z.string(), base64_file: z.string() }),
  'map.imported': z.object({}),
  'tick_rate.updated': z.object({ tick_rate: z.number().int().min(1) }),
  'agent.created': z
    .object({ agent_id: z.string(), agent_kind: z.string() })
    .catchall(z.unknown()),
  'agent.updated': z.object({ agent_id: z.string() }).catchall(z.unknown()),
  'agent.deleted': z.object({ agent_id: z.string() }),
  'agent.state': z
    .object({ agent_id: z.string(), agent_kind: z.string() })
    .catchall(z.unknown()),
  'event.created': z.object({ event_name: z.string() }).catchall(z.unknown()),
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
