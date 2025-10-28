export type Direction = 0 | 1 | 2 | 3; // 0:N, 1:E, 2:S, 3:W

export const DIR_N: Direction = 0;
export const DIR_E: Direction = 1;
export const DIR_S: Direction = 2;
export const DIR_W: Direction = 3;

export type ConnectorMask = number; // bitmask NESW in low 4 bits

export function maskFromDirs(dirs: Direction[]): ConnectorMask {
  return dirs.reduce((m, d) => m | (1 << d), 0);
}

export function has(m: ConnectorMask, d: Direction): boolean {
  return (m & (1 << d)) !== 0;
}

export function rotateMask(
  m: ConnectorMask,
  quarterTurns: number
): ConnectorMask {
  const t = ((quarterTurns % 4) + 4) % 4;
  let out = 0;
  for (let d: Direction = 0; d < 4; d++) {
    if ((m & (1 << d)) !== 0) {
      const nd = ((d + t) % 4) as Direction;
      out |= 1 << nd;
    }
  }
  return out;
}

export function opposite(d: Direction): Direction {
  return ((d + 2) % 4) as Direction;
}
