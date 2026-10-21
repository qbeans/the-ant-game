// All game randomness goes through here so tests and the simulator can make it deterministic.

let source = Math.random;

/** Returns a number in [0, 1). */
export const random = () => source();

/** Replaces the random source, e.g. with a seeded generator. */
export function setRandomSource(fn) {
  source = fn;
}

/** A small seeded generator (Park–Miller), handy for tests and simulations. */
export function seededRandom(seed) {
  let x = seed;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}
