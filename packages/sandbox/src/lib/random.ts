export type RandomOptions = {
  /**
   * Integer between 0-1
   */
  threshold: number;
}

/**
 * Random
 *
 * @example random(0.2)
 */
export function random(options?: RandomOptions) {
  const opt = {
    threshold: 0.2,
    ...options
  } satisfies RandomOptions;

  return Math.random() > opt.threshold;
}
