import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { CACHE_TTL } from "./with-cache";

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Currently we can only cache GET requests but it could be extended to support more methods (like POST, if we have the exact same url and body, etc.)
    if (req.method === "GET") {
      const cachedResponse: { response: HttpResponse<unknown>; ttl: number } | null = JSON.parse(
        localStorage.getItem(req.url)
      );

      return cachedResponse && Date.now() <= cachedResponse.ttl
        ? of(new HttpResponse(cachedResponse.response))
        : next.handle(req).pipe(
            tap((response) => {
              if (response instanceof HttpResponse) {
                localStorage.setItem(
                  req.url,
                  JSON.stringify({
                    response,
                    ttl: Date.now() + req.context.get(CACHE_TTL).ttl,
                  })
                );
              }
            })
          );
    }

    return next.handle(req);
  }
}
