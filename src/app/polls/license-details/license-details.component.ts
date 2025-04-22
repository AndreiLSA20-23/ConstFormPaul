import { Component } from '@angular/core';
import { DformComponent } from '../../display/dform/dform.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-license-details',
  template: `<app-dform componentName="app-license-details"></app-dform>`,
  standalone: true,
  imports: [CommonModule, DformComponent]
})
export class LicenseDetailsComponent {}
