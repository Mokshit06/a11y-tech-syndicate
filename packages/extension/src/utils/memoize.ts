export default function memoize<TFn extends (...args: any[]) => any>(fn: TFn) {
  const cache = new Map<any, any>();

  return function memoizedFunc(...args: Parameters<TFn>): ReturnType<TFn> {
    const cacheKey = args[0];

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const result = fn(...args);
    cache.set(cacheKey, result);

    return result;
  };
}
