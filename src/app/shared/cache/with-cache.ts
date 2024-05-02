import { HttpContext, HttpContextToken } from "@angular/common/http";

const ONE_HOUR_MILLIS = 60 * 60 * 1000;

// Currently the caching solution is pretty simple and straight forward, but it could be extended to support more complex needs (without breaking changes)
type CacheConfig = {
  /** Time to live in milliseconds *(default is 1 hour)* */
  ttl: number;
};

export const CACHE_TTL = new HttpContextToken<CacheConfig>(() => ({ ttl: ONE_HOUR_MILLIS }));

type WithCacheArg = CacheConfig['ttl'] | Partial<CacheConfig>;

export function withCache(ttlOrConfig?: WithCacheArg) {
  const config = parseWithCacheArg(ttlOrConfig);

  return new HttpContext().set(CACHE_TTL, config);
}

function parseWithCacheArg(ttlOrConfig?: WithCacheArg) {
  const defaultConfig = CACHE_TTL.defaultValue();

  return typeof ttlOrConfig === "number"
    ? { ...defaultConfig, ttl: ttlOrConfig }
    : { ...defaultConfig, ...ttlOrConfig };
}
