import { SimulationState } from '@/sim/store';

export interface AdvanceFrame {
  readonly deltaMs: number;
  readonly elapsedMs: number;
}

export type SimulationSystem = (
  state: SimulationState,
  frame: AdvanceFrame,
) => SimulationState;

export const composeSystems = (
  systems: ReadonlyArray<SimulationSystem>,
): SimulationSystem => {
  return (state: SimulationState, frame: AdvanceFrame) =>
    systems.reduce((accumulator, system) => system(accumulator, frame), state);
};

export const advanceSimulation = (
  state: SimulationState,
  frame: AdvanceFrame,
  systems: ReadonlyArray<SimulationSystem> = [],
): SimulationState => {
  if (systems.length === 0) {
    return state;
  }

  return composeSystems(systems)(state, frame);
};

export const noopSystem: SimulationSystem = (state) => state;
