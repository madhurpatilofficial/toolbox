import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CalculatorComponent } from './components/calculator/calculator.component';
import { FindcapitalComponent } from './components/findcapital/findcapital.component';
import { CurrencyconverterComponent } from './components/currencyconverter/currencyconverter.component';
import { ColorDisplayComponent } from './components/color-display/color-display.component';
import { FindflagComponent } from './components/findflag/findflag.component';
import { WorldClockComponent } from './components/world-clock/world-clock.component';
import { AgeCalculatorComponent } from './components/age-calculator/age-calculator.component';
import { CountriesComponent } from './components/countries/countries.component';
import { FontsComponent } from './components/fonts/fonts.component';
import { StringManipulatorComponent } from './components/data-manipulator/string-manipulator.component';
import { WeatherComponent } from './components/weather/weather.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'calculator',
    component: CalculatorComponent
  },
  {
    path: 'age-calculator',
    component: AgeCalculatorComponent
  },
  {
    path: 'currencyconverter',
    component: CurrencyconverterComponent
  },
  {
    path: 'findcapital',
    component: FindcapitalComponent
  },
  {
    path: 'colorpicker',
    component: ColorDisplayComponent
  },
  {
    path: 'findflag',
    component: FindflagComponent
  },
  {
    path: 'worldclock',
    component: WorldClockComponent
  },
  {
    path: 'population', loadChildren: () => import('./countries.module').then(m => m.CountriesModule)

  },
  {
    path: 'fontconverter',
    component: FontsComponent
  },
  {
    path: 'data-manipulation',
    component: StringManipulatorComponent
  },
  {
    path: 'weather-service',
    component: WeatherComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
