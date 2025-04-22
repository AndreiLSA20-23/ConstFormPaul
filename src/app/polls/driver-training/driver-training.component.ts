import { Component } from '@angular/core';
import { DformComponent } from '../../display/dform/dform.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-driver-training',
  template: `<app-dform componentName="app-driver-training"></app-dform>`,
  standalone: true,
  imports: [CommonModule, DformComponent],
})
export class DriverTrainingComponent {

}
