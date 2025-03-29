import { Component, HostListener, OnInit } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import { LocationService } from '../../services/location.service';
import { Color, ScaleType } from '@swimlane/ngx-charts'; // Import these

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
})
export class WeatherComponent implements OnInit {
  countries: string[] = [];
  cities: string[] = [];
  selectedCountry: string = '';
  selectedCity: string = '';
  weatherData: any = null;
  error: string = '';
  chartData: any[] = [];

  // In your component.ts file, add this property for responsive chart sizing
chartView: [number, number] = [600, 300];

// And add this to handle window resize
@HostListener('window:resize', ['$event'])
onResize(event: any) {
  this.adjustChartSize();
}


private adjustChartSize() {
  const width = window.innerWidth;
  if (width < 600) {
    this.chartView = [width - 40, 250];
  } else if (width < 768) {
    this.chartView = [width - 80, 250];
  } else if (width < 992) {
    this.chartView = [600, 300];
  } else {
    this.chartView = [700, 300];
  }
}
  
  // Fix for the color scheme
  colorScheme: Color = {
    name: 'weatherColors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2575fc', '#6a11cb', '#ff7e5f', '#30cfd0', '#ffc371']
  };

  constructor(private weatherService: WeatherService, private locationService: LocationService) {}

  ngOnInit(): void {
    this.fetchCountries();
    this.adjustChartSize();
  }

  fetchCountries(): void {
    this.locationService.getCountries().subscribe(
      (data) => {
        this.countries = data.map((country: any) => country.name.common).sort();
      },
      () => {
        this.error = 'Failed to load countries. Please try again later.';
      }
    );
  }

  onCountryChange(): void {
    this.cities = [];
    this.selectedCity = '';
    this.weatherData = null;
    
    if (!this.selectedCountry) return;
    
    this.locationService.getCities(this.selectedCountry).subscribe(
      (data) => {
        this.cities = data.data.sort();
      },
      () => {
        this.error = 'Failed to load cities for the selected country. Please try again.';
      }
    );
  }

  getWeather(): void {
    if (!this.selectedCity) return;
    
    this.error = '';
    this.weatherData = null;
    
    this.weatherService.getWeather(this.selectedCity).subscribe(
      (data) => {
        this.weatherData = data;
        this.updateChart();
      },
      (err) => {
        this.error = `Failed to load weather data: ${err.message || 'Unknown error'}`;
      }
    );
  }

  updateChart(): void {
    if (this.weatherData) {
      this.chartData = [
        { name: 'Temperature (°C)', value: this.weatherData.temperature },
        { name: 'Feels Like (°C)', value: this.weatherData.feelsLike },
        { name: 'Humidity (%)', value: this.weatherData.humidity },
        { name: 'Wind (km/h)', value: this.weatherData.windSpeed },
        { name: 'UV Index', value: this.weatherData.uvIndex },
      ];
    }
  }

  getWeatherIcon(): string {
    if (!this.weatherData || !this.weatherData.description) {
      return '❓';
    }
    
    const description = this.weatherData.description.toLowerCase();
    if (description.includes('clear')) return '☀️';
    if (description.includes('cloud')) return '☁️';
    if (description.includes('rain')) return '🌧️';
    if (description.includes('storm')) return '⛈️';
    if (description.includes('snow')) return '❄️';
    if (description.includes('wind')) return '💨';
    if (description.includes('fog') || description.includes('mist')) return '🌫️';
    if (description.includes('sun') && description.includes('cloud')) return '⛅';
    if (description.includes('drizzle')) return '🌦️';
    return '🌍';
  }
}