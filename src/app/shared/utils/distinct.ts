export function distinct<T, K = T>(array: T[], keySelector?: (item: T) => K) {
  const result = new Map<K | T, T>();

  for (const item of array) {
    const key = keySelector?.(item) ?? item;

    if (result.has(key)) continue;
    result.set(key, item);
  }

  return Array.from(result.values());
}
