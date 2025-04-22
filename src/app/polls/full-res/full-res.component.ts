import { Component } from '@angular/core';
import { DformComponent } from '../../display/dform/dform.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-full-res',
   template: `<app-dform componentName="app-full-res"></app-dform>`,
  standalone: true,
  imports: [CommonModule, DformComponent],
})
export class FullResComponent {

}
