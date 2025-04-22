import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-school-form',
  templateUrl: './school-form.component.html',
  styleUrls: ['./school-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf
  ],
  standalone: true
})
export class SchoolFormComponent implements OnInit, OnChanges {
  @Input() formData: any | null = null; // Переданные данные для формы
  @Input() countries: string[] = []; // Список стран
  @Input() states: string[] = []; // Список штатов для выбранной страны
  @Input() gapData: { startDate: Date; endDate: Date } | null = null; // Данные из gap
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() countryChange = new EventEmitter<string>(); // Событие изменения страны

  schoolForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.schoolForm = this.fb.group({
      schoolName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      countrySchool: ['', Validators.required],
      stateSchool: [''],
      city: ['', Validators.required],
      phoneSchool: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      fieldOfStudy: ['', Validators.required], // Added "What did you study?"
      graduationDate: [''] // Added "Graduation Date"
    });
  }

  ngOnInit(): void {
    if (this.formData) {
      this.schoolForm.patchValue(this.formData);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gapData'] && this.gapData) {
      this.schoolForm.patchValue({
        startDate: this.gapData.startDate,
        endDate: this.gapData.endDate,
      });
    }
  }

  /**
   * Обработка сохранения формы
   */
  onSave(): void {
    if (this.schoolForm.valid) {
      this.save.emit(this.schoolForm.value);
    }
  }

  /**
   * Обработка отмены редактирования
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Обработка изменения страны
   */
  onCountryChange(): void {
    const selectedCountry = this.schoolForm.get('countrySchool')?.value;
    this.countryChange.emit(selectedCountry);

    // Сброс значения штата, если страна изменилась
    if (this.schoolForm.get('stateSchool')) {
      this.schoolForm.get('stateSchool')?.reset();
    }
  }
}
