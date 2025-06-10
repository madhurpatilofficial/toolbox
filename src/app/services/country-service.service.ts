import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountryServiceService {
  // Updated to only request needed fields
  private apiUrl = 'https://restcountries.com/v3.1/all?fields=name,cca2,flags,population';
  private countriesCache$: Observable<any[]> | undefined;

  constructor(private http: HttpClient) {}

  getAllCountries(): Observable<any[]> {
    if (!this.countriesCache$) {
      this.countriesCache$ = this.http.get<any[]>(this.apiUrl).pipe(
        shareReplay(1) // Cache and share
      );
    }
    return this.countriesCache$;
  }

  getCountryPopulation(countryCode: string): Observable<number> {
    const url = `https://restcountries.com/v3.1/alpha/${countryCode}?fields=population`;
    return this.http.get<any[]>(url).pipe(
      map(response => response?.[0]?.population || 0),
      shareReplay(1)
    );
  }
}
