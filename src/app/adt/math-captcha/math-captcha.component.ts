/* adt/math-captcha.component.html */

import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-math-captcha',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './math-captcha.component.html',
  styleUrls: ['./math-captcha.component.scss']
})
export class MathCaptchaComponent {
  num1: number = 0;
  num2: number = 0;
  userAnswer: number | null = null;
  captchaStatus: boolean | null = null;

  @Output() captchaVerified = new EventEmitter<boolean>();

  constructor() {
    this.generateNumbers();
  }

  generateNumbers(): void {
    this.num1 = Math.floor(Math.random() * 10) + 1;
    this.num2 = Math.floor(Math.random() * 10) + 1;
  }

  checkAnswer(): void {
    if (this.userAnswer === this.num1 + this.num2) {
      this.captchaStatus = true;
      this.captchaVerified.emit(true);
    } else {
      this.captchaStatus = false;
      this.captchaVerified.emit(false);
      // Генерируем новые числа для повторной попытки
      this.generateNumbers();
      this.userAnswer = null;
    }
  }
}
