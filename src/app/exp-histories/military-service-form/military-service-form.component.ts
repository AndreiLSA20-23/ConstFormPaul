import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-military-service-form',
  templateUrl: './military-service-form.component.html',
  styleUrls: ['./military-service-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf
  ],
  standalone: true
})
export class MilitaryServiceFormComponent implements OnInit {
  @Input() formData: any | null = null; // Переданные данные для формы
  @Input() gapData: { startDate: Date; endDate: Date } | null = null; // Данные из gap
  @Input() countries: string[] = []; // Список стран
  @Input() states: string[] = []; // Список штатов для выбранной страны
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() countryChange = new EventEmitter<string>(); // Событие изменения страны

  militaryServiceForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.militaryServiceForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      countryMilit: ['', Validators.required],
      stateMilit: [''],
      branch: ['', Validators.required],
      rank: [''],
      dd214: ['yes', Validators.required],
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Инициализация формы с учетом переданных данных
   */
  private initializeForm(): void {
    if (this.formData) {
      console.log('Applying formData:', this.formData);
      this.militaryServiceForm.patchValue(this.formData);
    }

    if (this.gapData) {
      console.log('Applying gapData:', this.gapData);
      this.applyGapData(this.gapData);
    }
  }

  /**
   * Применяет данные gap к форме, если они корректны
   * @param gap - Объект с данными gap
   */
  private applyGapData(gap: { startDate: Date; endDate: Date }): void {
    if (gap && gap.startDate && gap.endDate) {
      this.militaryServiceForm.patchValue({
        startDate: gap.startDate,
        endDate: gap.endDate,
      });
    } else {
      console.error('Invalid gapData:', gap);
    }
  }

  /**
   * Обновляет форму на основе данных gap
   * @param gap - Промежуток времени
   */
  updateFormWithGap(gap: { startDate: Date; endDate: Date }): void {
    console.log('Updating form with gap:', gap);
    this.applyGapData(gap);
  }

  /**
   * Сохраняет данные формы
   */
  onSave(): void {
    if (this.militaryServiceForm.valid) {
      console.log('Form saved with data:', this.militaryServiceForm.value);
      this.save.emit(this.militaryServiceForm.value);
    } else {
      console.warn('Form is invalid:', this.militaryServiceForm);
    }
  }

  /**
   * Отмена редактирования формы
   */
  onCancel(): void {
    console.log('Form canceled');
    this.cancel.emit();
  }

  /**
   * Обработка изменения страны
   */
  onCountryChange(): void {
    const selectedCountry = this.militaryServiceForm.get('countryMilit')?.value;
    console.log('Country changed to:', selectedCountry);
    this.countryChange.emit(selectedCountry);

    if (selectedCountry === 'USA') {
      console.log('Fetching states for USA');
      // Здесь предполагается, что внешний компонент обновляет states
    } else {
      this.states = [];
    }

    // Сброс значения штата при смене страны
    if (this.militaryServiceForm.get('stateMilit')) {
      this.militaryServiceForm.get('stateMilit')?.reset();
    }
  }
}
