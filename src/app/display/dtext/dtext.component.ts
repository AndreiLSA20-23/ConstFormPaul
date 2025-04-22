import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { BaseComponent } from '../../base/base/base.component';
import { DinFormJsonWorkerService } from '../../services/din-form-json-worker.service';
import { NgIf, NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgClass } from '@angular/common';

@Component({
  selector: 'app-dtext',
  templateUrl: './dtext.component.html',
  styleUrls: ['./dtext.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgClass,
  ]
})
export class DtextComponent extends BaseComponent implements OnInit {
  // Используем входной параметр для установки имени секции JSON.
  @Input() override componentName: string = 'app-text-display';

  constructor(dinFormService: DinFormJsonWorkerService,  override cd: ChangeDetectorRef,) {
    super(dinFormService, cd);
  }

  override ngOnInit(): void {
    this.loadRequirements();
  }

  override onSubmit(): void {
    if (this.form.valid) {
      // Логика отправки данных на сервер
    } else {
      // Обработка невалидной формы
    }
  }

  override onCancel(): void {
    // Сброс формы
    this.form.reset();
  }
  override onSubmitFormArray(): void{
  }
}
