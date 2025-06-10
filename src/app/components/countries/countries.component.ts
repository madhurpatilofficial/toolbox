import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartType, registerables } from 'chart.js';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { debounceTime, Subject } from 'rxjs';
import { CountryServiceService } from '../../services/country-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('modalAnimation', [
      state('open', style({ opacity: 1, visibility: 'visible' })),
      state('closed', style({ opacity: 0, visibility: 'hidden' })),
      transition('closed => open', animate('300ms ease-out')),
      transition('open => closed', animate('300ms ease-in')),
    ]),
  ],
})
export class CountriesComponent implements OnInit {
  countries: any[] = [];
  selectedCountryCode: string = '';
  selectedCountryName: string = '';
  countryPopulation: number | undefined;
  errorMessage: string | undefined;
  chartType: string = 'bar';
  modalChartType: string = 'bar';
  chart: any;
  top5HighPopulation: any[] = [];
  top5LowPopulation: any[] = [];
  additionalInfo: any = {};
  isPopulationGraphModalOpen: boolean = false;
  isLoading: boolean = false;
  isGraphButtonBlinking: boolean = true;

  @ViewChild('populationChart') populationChart!: ElementRef;

  private countrySelectionSubject = new Subject<string>();

  constructor(private countryService: CountryServiceService) {
    Chart.register(...registerables);
    this.countrySelectionSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchCountryPopulation();
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.countryService.getAllCountries().subscribe(
      (countries) => {
        this.countries = countries;
        this.findTop5HighPopulation();
        this.findTop5LowPopulation();
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Error fetching countries. Please try again.';
        this.isLoading = false;
      }
    );
  }

  colors: string[] = [
    '#3498db',
    '#2ecc71',
    '#e74c3c',
    '#f1c40f',
    '#9b59b6',
    '#1abc9c',
    '#e67e22',
    '#34495e',
    '#ff6b6b',
    '#00cec9',
  ];

  onCountrySelectionChange() {
    this.countrySelectionSubject.next(this.selectedCountryCode);
  }

  // Add this to track if the chart should be visible
showChart: boolean = false;

// Modify your fetchCountryPopulation method
fetchCountryPopulation() {
  if (!this.selectedCountryCode) return;
  
  this.showChart = false; // Hide chart while loading
  this.isLoading = true;
  
  this.countryService.getCountryPopulation(this.selectedCountryCode).subscribe(
    (population) => {
      this.countryPopulation = population;
      this.selectedCountryName = this.countries.find(
        (country) => country.cca2 === this.selectedCountryCode
      )?.name.common;
      
      this.errorMessage = undefined;
      this.additionalInfo = this.countries.find(
        (country) => country.cca2 === this.selectedCountryCode
      );
      
      // Render chart after a small delay to ensure DOM is ready
      setTimeout(() => {
        this.renderChart();
        this.showChart = true;
      }, 100);
      
      this.isLoading = false;
    },
    (error) => {
      this.errorMessage = 'Error fetching population. Please try again.';
      this.countryPopulation = undefined;
      this.showChart = false;
      this.isLoading = false;
    }
  );
}
renderChart() {
  // Ensure we have required data
  if (!this.selectedCountryName || this.countryPopulation === undefined) {
    return;
  }

  // Get canvas element
  const canvas = document.getElementById('myChart') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Clear previous chart if exists
  if (this.chart) {
    this.chart.destroy();
  }

  // Set canvas dimensions
  const container = canvas.parentElement;
  if (container) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  // Get context
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#3498db');
  gradient.addColorStop(1, '#2ecc71');

  // Prepare data
  const data = {
    labels: [this.selectedCountryName],
    datasets: [{
      label: 'Population',
      data: [this.countryPopulation],
      backgroundColor: this.chartType === 'pie' ? [gradient] : gradient,
      borderColor: '#2c3e50',
      borderWidth: 1
    }]
  };

  // Common options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.raw.toLocaleString()}`;
          }
        }
      }
    }
  };

  // Create chart
  this.chart = new Chart(ctx, {
    type: this.chartType as ChartType,
    data: data
  });
}

  findTop5HighPopulation() {
    this.top5HighPopulation = this.countries
      .filter((country) => country.population !== undefined)
      .sort((a, b) => b.population - a.population)
      .slice(0, 5);
  }

  findTop5LowPopulation() {
    this.top5LowPopulation = this.countries
      .filter((country) => country.population !== undefined)
      .sort((a, b) => a.population - b.population)
      .slice(0, 5);
  }

  getCountryInfo(field: string): any {
    if (this.additionalInfo && this.additionalInfo[field]) {
      if (field === 'currencies') {
        const currencies = this.additionalInfo[field];
        const currencyNames = Object.values(currencies).map(
          (currency: any) => currency.name
        );
        return currencyNames.join(', ');
      } else if (field === 'flags' || field === 'coatOfArms') {
        return this.additionalInfo[field]?.png;
      } else if (typeof this.additionalInfo[field] === 'object') {
        return Object.values(this.additionalInfo[field]).join(', ');
      } else {
        return this.additionalInfo[field];
      }
    }
    return 'N/A';
  }

  openPopulationGraphModal() {
    this.isPopulationGraphModalOpen = true;
    setTimeout(() => this.renderPopulationChart(), 0);
  }

  closePopulationGraphModal() {
    this.isPopulationGraphModalOpen = false;
  }

  renderPopulationChart(): void {
    this.isLoading = true;
    this.countryService.getAllCountries().subscribe((countries) => {
      const labels = countries.map((country) => country.name.common);
      const populations = countries.map((country) => country.population);

      const ctx = this.populationChart.nativeElement.getContext('2d');
      if (ctx) {
        if (this.chart) {
          this.chart.destroy();
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(1, '#2ecc71');

        this.chart = new Chart(ctx, {
          type: this.modalChartType as ChartType,
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Population',
                data: populations,
                backgroundColor:
                  this.modalChartType === 'bar' || this.modalChartType === 'line'
                    ? gradient
                    : this.colors,
                borderColor: '#2c3e50',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 800,
              easing: 'easeOutQuart',
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#ecf0f1' },
                ticks: { color: '#2c3e50', font: { size: 11 } },
              },
              x: {
                grid: { display: false },
                ticks: { color: '#2c3e50', font: { size: 11 } },
              },
            },
            plugins: {
              legend: {
                display: true,
                labels: {
                  color: '#2c3e50',
                  font: { size: 11 },
                  filter: (legendItem: any, data: any) => {
                    if (
                      this.modalChartType === 'polarArea' ||
                      this.modalChartType === 'doughnut'
                    ) {
                      return false;
                    }
                    return true;
                  },
                },
              },
            },
          },
        });
      }
      this.isLoading = false;
    });
  }
}