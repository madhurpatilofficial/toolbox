import { Component, OnInit } from '@angular/core';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { FindCapitalService } from '../../services/find-capital.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { trigger, transition, style, animate, state, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-findcapital',
  templateUrl: './findcapital.component.html',
  styleUrls: ['./findcapital.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger('100ms', [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('pulse', [
      state('active', style({ transform: 'scale(1.05)' })),
      state('inactive', style({ transform: 'scale(1)' })),
      transition('inactive => active', animate('300ms ease-in')),
      transition('active => inactive', animate('300ms ease-out'))
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
  isSearching: boolean = false;
  showResults: boolean = false;
  pulseState: string = 'inactive';
  recentSearches: {country: string, capital: string}[] = [];
  countryFlag: string = '';
  countryInfo: any = null;
  themeMode: 'light' | 'dark' = 'light';
  currentYear: number = new Date().getFullYear(); // Added currentYear property

  
  protected searchTerm$ = new Subject<string>();

  constructor(
    private findCapitalService: FindCapitalService, 
    private breakpointObserver: BreakpointObserver
  ) { 
    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.themeMode = prefersDark ? 'dark' : 'light';
  }

  ngOnInit(): void {
    // Responsive breakpoint observer
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small, 
      Breakpoints.Medium, 
      Breakpoints.Large, 
      Breakpoints.XLarge
    ])
      .subscribe(result => {
        this.isLargeScreen = result.breakpoints[Breakpoints.Large] || 
                            result.breakpoints[Breakpoints.XLarge];
      });

    // Search pipeline
    this.searchTerm$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          this.isSearching = true;
          this.pulseState = 'active';
          return this.findCapitalService.findCapital(term);
        }),
        catchError(error => {
          this.handleFetchError(error);
          return of([]);
        })
      )
      .subscribe(
        (data) => {
          this.handleCountryData(data);
          this.isSearching = false;
          this.pulseState = 'inactive';
          this.showResults = true;
        }
      );

    // Fetch country names
    this.fetchCountryNames();
    
    // Load saved searches from localStorage
    this.loadRecentSearches();
  }

  fetchCountryNames(): void {
    this.isLoading = true;
    this.findCapitalService.fetchCountryNames().subscribe(
      (data: any[]) => {
        this.countryNames = data.map(country => country.name.common).sort();
        this.isLoading = false;
      },
      (error) => {
        this.handleFetchError(error);
        this.isLoading = false;
      }
    );
  }

  onCountrySelected(): void {
    if (this.selectedCountry) {
      this.searchTerm$.next(this.selectedCountry);
    }
  }

  private handleCountryData(data: any[]): void {
    if (Array.isArray(data) && data.length > 0) {
      const countryData = data[0];
      this.countryInfo = countryData;
      
      // Set country flag
      this.countryFlag = countryData.flags?.svg || countryData.flags?.png || '';
      
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
      
      // Add to recent searches
      this.addToRecentSearches();
    } else {
      this.capital = '';
      this.countryFlag = '';
      this.countryInfo = null;
      this.error = 'Country information not available for the specified name.';
    }
  }

  private handleFetchError(error: any): void {
    this.capital = '';
    this.countryFlag = '';
    this.countryInfo = null;
    this.error = 'Error fetching data from the API.';
    this.isLoading = false;
    this.isSearching = false;
  }

  private addToRecentSearches(): void {
    // Add current search to recent searches, avoiding duplicates
    const existingIndex = this.recentSearches.findIndex(item => item.country === this.selectedCountry);
    if (existingIndex !== -1) {
      this.recentSearches.splice(existingIndex, 1);
    }
    
    this.recentSearches.unshift({
      country: this.selectedCountry,
      capital: this.capital
    });
    
    // Keep only the last 5 searches
    if (this.recentSearches.length > 5) {
      this.recentSearches = this.recentSearches.slice(0, 5);
    }
    
    // Save to localStorage
    localStorage.setItem('recentCapitalSearches', JSON.stringify(this.recentSearches));
  }
  
  private loadRecentSearches(): void {
    const saved = localStorage.getItem('recentCapitalSearches');
    if (saved) {
      try {
        this.recentSearches = JSON.parse(saved);
      } catch (e) {
        this.recentSearches = [];
      }
    }
  }
  
  setCountry(country: string): void {
    this.selectedCountry = country;
    this.onCountrySelected();
  }
  
  toggleTheme(): void {
    this.themeMode = this.themeMode === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark-theme');
  }
  
  getFormattedPopulation(): string {
    if (!this.countryInfo || !this.countryInfo.population) {
      return 'Unknown';
    }
    return new Intl.NumberFormat().format(this.countryInfo.population);
  }
  
  getCurrencies(): string {
    if (!this.countryInfo || !this.countryInfo.currencies) {
      return 'Unknown';
    }
    
    return Object.values(this.countryInfo.currencies)
      .map((curr: any) => `${curr.name} (${curr.symbol || ''})`)
      .join(', ');
  }
  
  getLanguages(): string {
    if (!this.countryInfo || !this.countryInfo.languages) {
      return 'Unknown';
    }
    
    return Object.values(this.countryInfo.languages).join(', ');
  }
  
  resetSearch(): void {
    this.selectedCountry = '';
    this.capital = '';
    this.countryFlag = '';
    this.countryInfo = null;
    this.error = '';
    this.showResults = false;
  }
}