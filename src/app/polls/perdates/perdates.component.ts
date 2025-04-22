import { Component } from '@angular/core';
import { DformComponent } from '../../display/dform/dform.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perdates',
  template: `<app-dform componentName="app-perdates"></app-dform>`,
  standalone: true,
  imports: [CommonModule, DformComponent]
})
export class PerdatesComponent { }
