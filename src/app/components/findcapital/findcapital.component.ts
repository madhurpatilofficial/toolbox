import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { FindCapitalService } from '../../services/find-capital.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-findcapital',
  templateUrl: './findcapital.component.html',
  styleUrls: ['./findcapital.component.css']
})
export class FindcapitalComponent implements OnInit {
  selectedCountry: string = '';
  capital: string = '';
  error: string = '';
  countryNames: string[] = [];
  isLargeScreen: boolean = false;
  isLoading: boolean = true; // Add loading state

  protected searchTerm$ = new Subject<string>();

  constructor(private findCapitalService: FindCapitalService, private breakpointObserver: BreakpointObserver) { }

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(result => {
        this.isLargeScreen = result.matches;
      });

    // Initialize the search observable here instead of AfterViewInit
    this.searchTerm$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.findCapitalService.findCapital(term)),
        catchError(error => {
          this.handleFetchError(error);
          return of([]);
        })
      )
      .subscribe(
        (data) => {
          this.handleCountryData(data);
        }
      );

    // Fetch country names
    this.fetchCountryNames();
  }

  fetchCountryNames(): void {
    this.isLoading = true;
    this.findCapitalService.fetchCountryNames().subscribe(
      (data: any[]) => {
        this.countryNames = data.map(country => country.name.common);
        this.isLoading = false;
      },
      (error) => {
        this.handleFetchError(error);
        this.isLoading = false;
      }
    );
  }

  onCountrySelected(): void {
    this.searchTerm$.next(this.selectedCountry);
  }

  private handleCountryData(data: any[]): void {
    if (Array.isArray(data) && data.length > 0) {
      const countryData = data[0];
      if (this.selectedCountry === 'India') {
        this.capital = 'New Delhi';
      } else if ('capital' in countryData) {
        this.capital = Array.isArray(countryData.capital) ? countryData.capital[0] || 'Capital information not available' : countryData.capital || 'Capital information not available';
      } else {
        this.capital = 'Capital information not available';
      }
      this.error = ''; // Clear previous errors
    } else {
      this.capital = '';
      this.error = 'Country information not available for the specified name.';
    }
  }

  private handleFetchError(error: any): void {
    this.capital = '';
    this.error = 'Error fetching data from the API.';
    this.isLoading = false;
  }
}