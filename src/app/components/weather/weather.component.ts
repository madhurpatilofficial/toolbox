import { Component, HostListener, OnInit } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import { LocationService } from '../../services/location.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent implements OnInit {
  countries: string[] = [];
  cities: string[] = [];
  selectedCountry: string = '';
  selectedCity: string = '';
  weatherData: any = null;
  error: string = '';
  chartData: any[] = [];
  isDarkMode: boolean = false;
  weatherDetails: any[] = [];
  locationLabel: string = '';

  chartView: [number, number] = [600, 300];

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
    this.checkDarkModePreference();
  }

  @HostListener('window:resize')
  onResize() {
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

  private checkDarkModePreference() {
    const darkModePref = localStorage.getItem('darkMode');
    if (darkModePref !== null) {
      this.isDarkMode = darkModePref === 'true';
    } else {
      this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
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
    this.locationLabel = '';

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
        // store a human-friendly location label (City, Country) if available from selection
        this.locationLabel = `${this.selectedCity}${this.selectedCountry ? ', ' + this.selectedCountry : ''}`;
        this.updateChart();
        this.prepareWeatherDetails();
      },
      (err) => {
        this.error = `Failed to load weather data: ${err.message || 'Unknown error'}`;
      }
    );
  }

  /**
   * Convert ISO datetime (local timezone ISO string from Open-Meteo) to a friendly time string.
   * Example input: "2025-11-22T06:44:00+05:30" or "2025-11-22T06:44"
   */
  private formatTime(isoOrNull: string | null): string {
    if (!isoOrNull) return 'N/A';
    try {
      // Create Date object - many Open-Meteo daily sunrise/sunset values are ISO strings with timezone
      const d = new Date(isoOrNull);
      if (isNaN(d.getTime())) {
        // fallback: attempt to parse without timezone
        const parts = isoOrNull.split('T');
        if (parts.length > 1) {
          const timePart = parts[1].split('+')[0].split('Z')[0];
          const today = new Date();
          const fallback = new Date(`${today.toISOString().split('T')[0]}T${timePart}`);
          if (!isNaN(fallback.getTime())) {
            return fallback.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
          }
        }
        return isoOrNull;
      }
      // Return time in user's locale, show hour:minute (AM/PM as per locale)
      return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    } catch {
      return isoOrNull;
    }
  }

  prepareWeatherDetails(): void {
    if (!this.weatherData) return;

    // Format sunrise/sunset to local friendly times
    const formattedSunrise = this.formatTime(this.weatherData.sunrise);
    const formattedSunset = this.formatTime(this.weatherData.sunset);
    const humidity = this.weatherData.humidity !== null && this.weatherData.humidity !== undefined ? `${this.weatherData.humidity}%` : 'N/A';
    const uv = this.weatherData.uvIndex !== null && this.weatherData.uvIndex !== undefined ? this.weatherData.uvIndex : 'N/A';

    this.weatherDetails = [
      {
        label: 'Humidity',
        value: humidity,
        icon: 'opacity',
        iconClass: 'humidity-icon'
      },
      {
        label: 'Wind Speed',
        value: `${this.weatherData.windSpeed} km/h`,
        icon: 'air',
        iconClass: 'wind-icon'
      },
      {
        label: 'UV Index',
        value: uv,
        icon: 'wb_sunny',
        iconClass: 'uv-icon'
      },
      {
        label: 'Sunrise',
        value: formattedSunrise,
        icon: 'brightness_5',
        iconClass: 'sunrise-icon'
      },
      {
        label: 'Sunset',
        value: formattedSunset,
        icon: 'brightness_4',
        iconClass: 'sunset-icon'
      }
    ];
  }

  updateChart(): void {
    if (this.weatherData) {
      this.chartData = [
        { name: 'Temperature (°C)', value: this.weatherData.temperature },
        { name: 'Feels Like (°C)', value: this.weatherData.feelsLike },
        { name: 'Humidity (%)', value: this.weatherData.humidity ?? 0 },
        { name: 'Wind (km/h)', value: this.weatherData.windSpeed },
        { name: 'UV Index', value: this.weatherData.uvIndex ?? 0 },
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

  getWeatherIconClass(): string {
    if (!this.weatherData || !this.weatherData.description) {
      return 'unknown-weather';
    }

    const description = this.weatherData.description.toLowerCase();
    if (description.includes('clear')) return 'clear-weather';
    if (description.includes('cloud')) return 'cloudy-weather';
    if (description.includes('rain')) return 'rainy-weather';
    if (description.includes('storm')) return 'stormy-weather';
    if (description.includes('snow')) return 'snowy-weather';
    if (description.includes('wind')) return 'windy-weather';
    if (description.includes('fog') || description.includes('mist')) return 'foggy-weather';
    return 'unknown-weather';
  }
}
