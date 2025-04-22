import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { AddAddressService } from '../../services/add-address-service.service';
import { OperateMotorVehicleComponent } from '../../exp-histories/operate-motor-vehicle/operate-motor-vehicle.component';

@Component({
  selector: 'app-employment-form',
  templateUrl: './employment-form.component.html',
  styleUrls: ['./employment-form.component.scss'],
  imports: [ReactiveFormsModule, NgIf, OperateMotorVehicleComponent, NgForOf],
  standalone: true,
})
export class EmploymentFormComponent implements OnInit, OnChanges {
  @Input() formData: any | null = null; // Данные для заполнения формы
  @Input() countries: string[] = []; // Список стран
  @Input() states: string[] = []; // Список штатов для выбранной страны
  @Input() gapData: { startDate: Date; endDate: Date } | null = null; // Данные из Gap
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() countryChange = new EventEmitter<string>(); // Событие изменения страны

  employmentForm: FormGroup;
  showCommercialVehicleDetails: boolean = false; // Для управления отображением дочернего компонента
  motorVehicleData: any = {}; // Данные из OperateMotorVehicleComponent

  constructor(
    private fb: FormBuilder,
    private addAddressService: AddAddressService
  ) {
    this.employmentForm = this.fb.group({
      companyName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      city: ['', Validators.required],
      state: [''], // Динамическая обязательность
      country: ['', Validators.required],
      lineAddress_1: ['', Validators.required],
      lineAddress_2: [''],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      telephone: ['', [Validators.pattern(/^\+?[0-9]+$/)]],
      positionHeld: ['', Validators.required],
      reasonForLeaving: ['', Validators.required], // Сделано обязательным
      terminated: [false], // Радиокнопки
      currentEmployer: [false], // Радиокнопки
      contactEmployer: [false], // Радиокнопки
      commercialVehicle: [false], // Радиокнопки

      // Поля дочернего компонента
      federalRegulations: [null],
      safetyFunctions: [null],
      areasDriven: [''],
      payRange: [null],
      mostCommonTruck: [null],
      mostCommonTrailer: [null],
      trailerLength: [null],
    });
  }

  ngOnInit(): void {
    if (this.formData) {
      this.employmentForm.patchValue(this.formData);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formData']?.currentValue) {
      this.employmentForm.patchValue(this.formData);
    }

    if (changes['gapData']?.currentValue && this.gapData) {
      const formattedGapData = {
        startDate: this.gapData.startDate.toISOString().split('T')[0],
        endDate: this.gapData.endDate.toISOString().split('T')[0],
      };
      this.employmentForm.patchValue(formattedGapData);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.employmentForm.get(fieldName);
    return (control?.touched && control?.invalid) || false;
  }

  onCountryChange(): void {
    const selectedCountry = this.employmentForm.get('country')?.value;

    if (selectedCountry === 'United States') {
      this.employmentForm.get('state')?.setValidators(Validators.required);
    } else {
      this.employmentForm.get('state')?.clearValidators();
      this.employmentForm.get('state')?.setValue(''); // Сбрасываем значение
    }

    this.employmentForm.get('state')?.updateValueAndValidity(); // Обновляем состояние поля
    this.states = selectedCountry === 'United States'
      ? this.addAddressService.getStatesForCountry(selectedCountry)
      : [];
    this.countryChange.emit(selectedCountry);
  }

  onCommercialVehicleChange(value: boolean): void {
    this.showCommercialVehicleDetails = value;

    if (!value) {
      // Очищаем валидаторы и значения дочернего компонента
      ['federalRegulations', 'safetyFunctions', 'areasDriven', 'payRange', 'mostCommonTruck', 'mostCommonTrailer', 'trailerLength'].forEach(
        (field) => {
          this.employmentForm.get(field)?.clearValidators();
          this.employmentForm.get(field)?.setValue(null);
        }
      );
    } else {
      // Устанавливаем валидаторы при выборе "Yes"
      this.employmentForm.get('federalRegulations')?.setValidators(Validators.required);
      this.employmentForm.get('safetyFunctions')?.setValidators(Validators.required);
      this.employmentForm.get('areasDriven')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.employmentForm.get('payRange')?.setValidators([Validators.required, Validators.min(0)]);
      this.employmentForm.get('mostCommonTruck')?.setValidators(Validators.required);
      this.employmentForm.get('mostCommonTrailer')?.setValidators(Validators.required);
      this.employmentForm.get('trailerLength')?.setValidators(Validators.required);
    }

    this.employmentForm.updateValueAndValidity(); // Обновляем состояние формы
  }

  onMotorVehicleDataChange(data: any): void {
    this.motorVehicleData = data;
    this.employmentForm.patchValue(data);
  }

  onSave(): void {
    if (this.employmentForm.valid) {
      const formValue = {
        ...this.employmentForm.value,
        motorVehicleData: this.motorVehicleData,
      };

      this.save.emit(formValue);
    } else {
      this.employmentForm.markAllAsTouched();
    }
  }
}
