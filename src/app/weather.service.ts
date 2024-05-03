import {Injectable, Signal, signal} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './current-conditions/current-conditions.type';
import {ConditionsAndZip} from './conditions-and-zip.type';
import {Forecast} from './forecasts-list/forecast.type';
import { LocationService } from './location.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { withCache } from './shared/cache';

@Injectable()
export class WeatherService {

  static TWO_HOURS_MILLIS = 2 * 60 * 60 * 1000;
  static URL = 'https://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';
  private currentConditions = signal<ConditionsAndZip[]>([]);

  // Here is the side effect that will be triggered when a new location is added or removed
  // It will add or remove the current conditions for the location as it was before
  readonly #updateCurrentConditions = this.locationService.action$.pipe(takeUntilDestroyed()).subscribe(({ type, zipcode }) => {
    switch (type) {
      case 'add':
        this.addCurrentConditions(zipcode);
        break;
      case 'remove':
        this.removeCurrentConditions(zipcode);
        break;
    }
  });

  constructor(private http: HttpClient, private readonly locationService: LocationService) {}

  addCurrentConditions(zipcode: string): void {
    // Here we make a request to get the current conditions data from the API. Note the use of backticks and an expression to insert the zipcode
    this.http.get<CurrentConditions>(
      `${WeatherService.URL}/weather?zip=${zipcode},fr&units=metric&APPID=${WeatherService.APPID}`,
      { context: withCache(WeatherService.TWO_HOURS_MILLIS) }
    ).subscribe(data => this.currentConditions.update(conditions => [...conditions, {zip: zipcode, data}]));
  }

  removeCurrentConditions(zipcode: string) {
    this.currentConditions.update(conditions => {
      for (let i in conditions) {
        if (conditions[i].zip == zipcode)
          conditions.splice(+i, 1);
      }
      return conditions;
    })
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {
    // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode
    return this.http.get<Forecast>(
      `${WeatherService.URL}/forecast/daily?zip=${zipcode},fr&units=metric&cnt=5&APPID=${WeatherService.APPID}`,
      { context: withCache(WeatherService.TWO_HOURS_MILLIS) }
    );
  }

  getWeatherIcon(id): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + "art_fog.png";
    else
      return WeatherService.ICON_URL + "art_clear.png";
  }

}
