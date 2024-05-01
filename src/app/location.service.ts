import { Injectable } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Subject } from "rxjs";
import { scan, tap } from "rxjs/operators";

export const LOCATIONS: string = "locations";

type Locations = string[];

type LocationAction = { type: "add" | "remove"; zipcode: Locations[number] };

function reduceLocations(locations: Locations, action: LocationAction) {
  // As the reducer function only has to return a value, I like to use this object pattern wich is more concise than a switch statement
  return (<Record<LocationAction["type"], Locations>>{
    add: [...new Set([...locations, action.zipcode])], // add a new location and prevent duplicates thanks to the Set
    remove: locations.filter((location) => location !== action.zipcode),
  })[action.type];
}

@Injectable()
export class LocationService {
  readonly #action$ = new Subject<LocationAction>();
  readonly action$ = this.#action$.asObservable();

  readonly #locations$ = this.action$.pipe(
    scan(reduceLocations, this.#retrieveStoredLocations()),
    tap((locations) => localStorage.setItem(LOCATIONS, JSON.stringify(locations)))
  );

  readonly locations = toSignal(this.#locations$, {
    initialValue: this.#retrieveStoredLocations(),
  });

  constructor() {
    // queueMicrotask is used there to ensure the locations are added after the service is created
    queueMicrotask(() => {
      for (const loc of this.#retrieveStoredLocations()) this.addLocation(loc);
    });
  }

  addLocation(zipcode: string) {
    this.#action$.next({ type: "add", zipcode });
  }

  removeLocation(zipcode: string) {
    this.#action$.next({ type: "remove", zipcode });
  }

  // In order to avoid calling this method multiple times, it could be stored in a private property but I don't want to store the initial value in memory
  #retrieveStoredLocations(): Locations {
    const locString = localStorage.getItem(LOCATIONS);
    return JSON.parse(locString) ?? [];
  }
}
