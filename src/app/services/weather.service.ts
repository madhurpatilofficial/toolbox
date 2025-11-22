import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

interface GeocodeResult {
  results?: Array<{
    latitude: number;
    longitude: number;
    name?: string;
    country?: string;
    admin1?: string;
  }>;
}

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current_weather?: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
  };
  hourly?: {
    time: string[];
    relativehumidity_2m?: number[];
    uv_index?: number[];
  };
  daily?: {
    sunrise?: string[];
    sunset?: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private geocodeUrl = 'https://geocoding-api.open-meteo.com/v1/search';
  private weatherUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  getWeather(city: string): Observable<any> {
    if (!city || !city.trim()) {
      return throwError(() => new Error('City name is required'));
    }

    const geocodeParams = new HttpParams()
      .set('name', city)
      .set('count', '1')
      .set('language', 'en');

    return this.http.get<GeocodeResult>(this.geocodeUrl, { params: geocodeParams }).pipe(
      switchMap((geo) => {
        const result = geo?.results && geo.results.length > 0 ? geo.results[0] : null;
        if (!result) {
          return throwError(() => new Error(`No geocoding result found for "${city}"`));
        }

        const lat = result.latitude;
        const lon = result.longitude;

        const weatherParams = new HttpParams()
          .set('latitude', lat.toString())
          .set('longitude', lon.toString())
          .set('current_weather', 'true')
          .set('hourly', 'relativehumidity_2m,uv_index')
          .set('daily', 'sunrise,sunset')
          .set('timezone', 'auto')
          .set('temperature_unit', 'celsius')
          .set('windspeed_unit', 'kmh');

        return this.http.get<OpenMeteoResponse>(this.weatherUrl, { params: weatherParams }).pipe(
          map((w) => this.mapOpenMeteoToAppFormat(w)),
          catchError((err) => throwError(() => new Error(err?.message || 'Failed to fetch weather data')))
        );
      }),
      catchError((err) => throwError(() => new Error(err?.message || 'Failed to fetch geocoding/weather')))
    );
  }

  private mapOpenMeteoToAppFormat(resp: OpenMeteoResponse) {
    if (!resp || !resp.current_weather) {
      throw new Error('Malformed weather response');
    }

    const current = resp.current_weather;
    const time = current.time;

    let humidity: number | null = null;
    let uvIndex: number | null = null;

    if (resp.hourly && resp.hourly.time && resp.hourly.time.length > 0) {
      const idx = resp.hourly.time.indexOf(time);
      if (idx >= 0) {
        humidity = resp.hourly.relativehumidity_2m?.[idx] ?? null;
        uvIndex = resp.hourly.uv_index?.[idx] ?? null;
      } else {
        humidity = resp.hourly.relativehumidity_2m?.[0] ?? null;
        uvIndex = resp.hourly.uv_index?.[0] ?? null;
      }
    }

    const sunrise = resp.daily?.sunrise?.length ? resp.daily.sunrise[0] : null;
    const sunset = resp.daily?.sunset?.length ? resp.daily.sunset[0] : null;

    const description = this.getDescriptionFromWeatherCode(current.weathercode);
    const feelsLike = current.temperature; // fallback

    return {
      temperature: current.temperature,
      feelsLike,
      humidity,
      windSpeed: current.windspeed,
      uvIndex,
      sunrise,
      sunset,
      description
    };
  }

  private getDescriptionFromWeatherCode(code: number): string {
    const map: { [k: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };

    return map[code] ?? `Weather code ${code}`;
  }
}
