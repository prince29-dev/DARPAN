const store = new Map<string, unknown>();

export function getOrSetCache<T>(key: string, factory: () => T): T {
  if (store.has(key)) {
    return store.get(key) as T;
  }
  const value = factory();
  store.set(key, value);
  return value;
}

export function clearGtfsCache(): void {
  store.clear();
}
