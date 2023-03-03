const resultsMap = new WeakMap();

export default function once(func: (...args: unknown[]) => void): (...args: unknown[]) => unknown {
  console.debug(`[@vc-shell/framework#useFunctions:once] - Entry point`);
  return function (...args: unknown[]): unknown {
    if (!resultsMap.has(func)) {
      const result = func(...args);
      resultsMap.set(func, result);
    }
    return resultsMap.get(func);
  };
}
