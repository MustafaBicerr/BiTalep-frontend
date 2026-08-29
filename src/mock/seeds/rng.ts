/**
 * Deterministic linear congruential generator (Numerical Recipes constants).
 * Seeds must never use Math.random so every reload produces the same dataset.
 */
export function createRng(seed: number) {
  let state = seed >>> 0
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 0x100000000
  }
  return {
    next,
    /** Integer in [min, max] inclusive. */
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
    /** Picks an index using relative weights. */
    weighted: (weights: readonly number[]): number => {
      const total = weights.reduce((sum, w) => sum + w, 0)
      let roll = next() * total
      for (let i = 0; i < weights.length; i++) {
        roll -= weights[i]
        if (roll < 0) return i
      }
      return weights.length - 1
    },
  }
}

export type Rng = ReturnType<typeof createRng>
