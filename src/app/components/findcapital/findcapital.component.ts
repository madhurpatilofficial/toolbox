import { Component, OnInit } from '@angular/core';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { FindCapitalService } from '../../services/find-capital.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-findcapital',
  templateUrl: './findcapital.component.html',
  styleUrls: ['./findcapital.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('500ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class FindcapitalComponent implements OnInit {
  selectedCountry: string = '';
  capital: string = '';
  error: string = '';
  countryNames: string[] = [];
  isLargeScreen: boolean = false;
  isLoading: boolean = true;

  protected searchTerm$ = new Subject<string>();

  constructor(
    private findCapitalService: FindCapitalService, 
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    // Responsive breakpoint observer
    this.breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(result => {
        this.isLargeScreen = result.matches;
      });

    // Search pipeline
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
        this.countryNames =  data.map(country => country.name.common).sort();
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
        this.capital = Array.isArray(countryData.capital) 
          ? countryData.capital[0] || 'Capital information not available' 
          : countryData.capital || 'Capital information not available';
      } else {
        this.capital = 'Capital information not available';
      }
      this.error = '';
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