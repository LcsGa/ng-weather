import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { CacheInterceptor } from "./cache.interceptor";
import { makeEnvironmentProviders } from "@angular/core";

export function provideHttpCaching(/* A config param could be passed to configure the cache for more complex needs */) {
  return makeEnvironmentProviders([
    // Here could be provided an InjectionToken to configure the cache.
    // That token would be used within the CacheInterceptor and even within the withCache function
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true,
    },
  ]);
}
