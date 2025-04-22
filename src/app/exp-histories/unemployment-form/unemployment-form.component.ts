import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-unemployment-form',
  templateUrl: './unemployment-form.component.html',
  styleUrls: ['./unemployment-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  standalone: true
})
export class UnemploymentFormComponent implements OnInit, OnChanges {
  @Input() formData: any | null = null; // Passed form data
  @Input() gapData: { startDate: Date; endDate: Date } | null = null; // Gap data input
  @Output() save = new EventEmitter<any>(); // Emits when form is saved
  @Output() cancel = new EventEmitter<void>(); // Emits when form is canceled

  unemploymentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.unemploymentForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      comments: [''],
    });
  }

  ngOnInit(): void {
    // Patch the form with existing data if provided
    if (this.formData) {
      this.unemploymentForm.patchValue(this.formData);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Patch form with gap data if `gapData` changes
    if (changes['gapData'] && this.gapData) {
      this.unemploymentForm.patchValue({
        startDate: this.gapData.startDate,
        endDate: this.gapData.endDate,
      });
    }
  }

  /**
   * Emits the form data when saved
   */
  onSave(): void {
    if (this.unemploymentForm.valid) {
      this.save.emit(this.unemploymentForm.value);
    }
  }

  /**
   * Emits the cancel event when called
   */
  onCancel(): void {
    this.cancel.emit();
  }
}
