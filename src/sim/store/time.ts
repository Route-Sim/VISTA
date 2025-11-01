export interface SimClock {
  tick: number; // authoritative server tick
  timeMs: number; // server-aligned wall time in ms for interpolation
}

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

export const computeAlpha = (
  timeA: number,
  timeB: number,
  target: number,
): number => {
  if (timeB === timeA) return 0;
  return clamp01((target - timeA) / (timeB - timeA));
};
