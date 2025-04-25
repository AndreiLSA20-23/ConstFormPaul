import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { SsnMaskDirective } from '../dirs/ssn-mask.directive';
import { MathCaptchaComponent } from '../adt/math-captcha/math-captcha.component'; // Importing the math captcha component

@Component({
  selector: 'app-user-auth',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgIf,
    SsnMaskDirective,
    MathCaptchaComponent, // Adding the captcha component
  ],
  templateUrl: './user-auth.component.html',
  styleUrls: ['./user-auth.component.scss'],
})
export class UserAuthComponent {
  authForm: FormGroup;
  minAge = 23;
  maxAge = 75;
  message: string = '';
  captchaPassed: boolean = false; // Flag indicating if the math captcha was passed

  constructor(private fb: FormBuilder, private router: Router) {
    // Creating the form with validators
    this.authForm = this.fb.group({
      ssn: [
        '',
        [Validators.required, Validators.pattern(/^\d{3}-\d{2}-\d{4}$/)],
      ],
      dateOfBirth: [
        '',
        [Validators.required, this.validateAge.bind(this), this.validateFutureDate],
      ],
      noCriminalRecord: [false, Validators.requiredTrue],
      acceptTerms: [false, Validators.requiredTrue],
    });
  }

  private validateAge(control: AbstractControl) {
    const dateOfBirth = new Date(control.value);
    if (isNaN(dateOfBirth.getTime())) {
      return { invalidDate: true };
    }
    const age = this.calculateAge(dateOfBirth);
    if (age < this.minAge) return { tooYoung: true };
    if (age > this.maxAge) return { tooOld: true };
    return null;
  }

  private validateFutureDate(control: AbstractControl) {
    const dateOfBirth = new Date(control.value);
    const today = new Date();
    if (dateOfBirth > today) return { futureDate: true };
    return null;
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age -= 1;
    }
    return age;
  }

  // Method to receive the result from MathCaptchaComponent
  onMathCaptchaVerified(passed: boolean) {
    this.captchaPassed = passed;
  }

  // Handling the form submission
  async onSubmit() {
    if (this.authForm.valid && this.captchaPassed) {
      const formData = {
        ssn: this.authForm.get('ssn')?.value,
        bday: this.authForm.get('dateOfBirth')?.value,
      };

      try {
        // First request: check/add SSN
        const checkResponse = await fetch('http://64.251.23.111:8000/api/check-ssn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const checkData = await checkResponse.json();
        if (!checkResponse.ok) {
          throw new Error(checkData.detail || 'Error checking data');
        }

        // Second request: create or update JSON file for this SSN
        const fileResponse = await fetch('http://64.251.23.111:8000/api/create-or-update-json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const fileData = await fileResponse.json();
        if (!fileResponse.ok) {
          throw new Error(fileData.detail || 'Error creating file');
        }

        // Save the current SSN and Bday for future use (e.g., in localStorage)
        localStorage.setItem('currentUserSSN', formData.ssn);
        localStorage.setItem('currentUserBday', formData.bday);

        // Show the message and navigate to the next component (e.g., history)
        this.message = checkData.message; // or fileData.message
        this.router.navigate(['/history-form']);

      } catch (error: any) {
        this.message = `Error: ${error.message}`;
      }
    } else {
      this.message = 'Please fill out the form correctly and pass the captcha.';
    }
  }
}
