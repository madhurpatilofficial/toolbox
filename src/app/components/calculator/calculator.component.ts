import { Component, OnInit } from '@angular/core';

interface CalculatorButton {
  label: string;
  value: string;
}

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent implements OnInit {
  result: string = '';
  currentInput: string = '';

  calculatorButtons: CalculatorButton[] = [
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '/', value: '/' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '*', value: '*' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '-', value: '-' },
    { label: '0', value: '0' },
    { label: '.', value: '.' },
    { label: '+', value: '+' },
    { label: 'C', value: 'C' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  handleButtonClick(value: string): void {
    if (value === '=') {
      this.calculateResult();
    } else if (value === 'C') {
      this.clear();
    } else {
      this.currentInput += value;
      this.calculateResult(); // Calculate result as the user types
    }
  }
   calculateResult(): void {
    try {
      this.result = eval(this.currentInput).toString();
    } catch (error) {
      this.result = 'Error';
    }
  }

  clear(): void {
    this.result = '';
    this.currentInput = '';
  }
}