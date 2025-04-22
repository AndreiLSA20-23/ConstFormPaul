import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {trailerLengths, mostCommonTrailers, mostCommonTrucks } from '../../models/start-data';


@Component({
  selector: 'app-operate-motor-vehicle',
  imports: [NgForOf, ReactiveFormsModule, NgIf],
  templateUrl: './operate-motor-vehicle.component.html',
  standalone: true,
  styleUrls: ['./operate-motor-vehicle.component.scss'],
})
export class OperateMotorVehicleComponent implements OnInit {
  trailerLengths = trailerLengths;
  mostCommonTrailers = mostCommonTrailers;
  mostCommonTrucks = mostCommonTrucks;
  @Output() motorVehicleDataChange = new EventEmitter<any>(); // Событие для передачи данных родителю
  @Input() parentForm!: FormGroup; // Получение родительского FormGroup
  // Списки для выпадающих полей


  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Подписка на изменения в родительской форме
    if (this.parentForm) {
      this.parentForm.valueChanges.subscribe(() => {
        if (this.parentForm.valid) {
          this.motorVehicleDataChange.emit(this.parentForm.value);
        }
      });
    }
  }

  /**
   * Проверка на наличие ошибок в поле
   * @param field Название поля
   * @returns {boolean} true, если поле содержит ошибки
   */
  isFieldInvalid(field: string): boolean {
    const control = this.parentForm?.get(field);
    return (control?.touched && control?.invalid) || false;
  }

  
  onSave(): void {
    if (this.parentForm.valid) {
      const formData = this.parentForm.value;
      console.log('Saved Motor Vehicle Data:', formData);
      this.motorVehicleDataChange.emit(formData); 
    } else {
      this.parentForm.markAllAsTouched(); 
    }
  }
}
