import { Component, Input } from '@angular/core';
import {
  CommonModule,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgIf,
  NgForOf,
  NgClass
} from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagen-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgClass
  ],
  template: `
    <ng-container [formGroup]="form">
      <ng-container [ngSwitch]="el['type']">

        <!-- textbox -->
        <ng-container *ngSwitchCase="'textbox'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <input [id]="el['id']" type="text"
                   [formControlName]="el['formControlName'] || el['id']"
                   [placeholder]="el['placeholder']"
                   [ngClass]="el['cssClasses']" />
            <div class="text-danger"
                 *ngIf="form.get(el['formControlName'] || el['id'])?.invalid &&
                        form.get(el['formControlName'] || el['id'])?.touched">
              {{ el['validationMessage'] || 'Invalid input' }}
            </div>
          </div>
        </ng-container>

        <!-- dropdown -->
        <ng-container *ngSwitchCase="'dropdown'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <select [id]="el['id']"
                    [formControlName]="el['formControlName'] || el['id']"
                    [ngClass]="el['cssClasses']" class="form-select">
              <option *ngFor="let opt of el['options']" [value]="opt">{{ opt }}</option>
            </select>
          </div>
        </ng-container>

        <!-- button -->
        <ng-container *ngSwitchCase="'button'">
          <div>
            <button *ngIf="el['action']?.type === 'submit'" [ngClass]="el['cssClasses']" type="submit">
              {{ el['label'] }}
            </button>
            <button *ngIf="el['action']?.type === 'button'" [ngClass]="el['cssClasses']" type="button"
                    (click)="el['action']?.callback === 'onCancel' ? onCancel() : (el['action']?.callback === 'onEdit' ? onEdit() : null)">
              {{ el['label'] }}
            </button>
          </div>
        </ng-container>

        <!-- countryDropdown -->
        <ng-container *ngSwitchCase="'countryDropdown'">
          <div class="row align-items-center mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <div class="col">
              <label for="countryDropdown">
                {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
              </label>
              <select id="countryDropdown"
                      [formControlName]="el['formControlName'] || el['id']"
                      class="form-select form-select-sm"
                      (change)="onCountryChange($event)">
                <option *ngFor="let country of countryDropdownData.countries" [value]="country">
                  {{ country }}
                </option>
              </select>
            </div>
            <div class="col" *ngIf="form.get('state')">
              <label for="state">{{ countryDropdownData.stateLabel }}</label>
              <select id="state"
                      formControlName="state"
                      class="form-select form-select-sm">
                <option *ngFor="let state of getStatesForSelectedCountry()" [value]="state">
                  {{ state }}
                </option>
              </select>
            </div>
          </div>
        </ng-container>

        <!-- heading -->
        <ng-container *ngSwitchCase="'heading'">
          <h1 [ngClass]="el['cssClasses']"
              [innerHTML]="el['content'] || el['defaultValue'] || el['label']">
          </h1>
        </ng-container>

        <!-- paragraph -->
        <ng-container *ngSwitchCase="'paragraph'">
          <p [ngClass]="el['cssClasses']"
             [innerHTML]="el['defaultValue'] || el['content']">
          </p>
        </ng-container>

        <!-- list -->
        <ng-container *ngSwitchCase="'list'">
          <div [ngClass]="el['cssClasses']">
            <div [innerHTML]="el['defaultValue']"></div>
            <ul>
              <li *ngFor="let item of el['items']" [innerHTML]="item"></li>
            </ul>
          </div>
        </ng-container>

        <!-- password -->
        <ng-container *ngSwitchCase="'password'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <input [id]="el['id']" type="password"
                   [formControlName]="el['formControlName'] || el['id']"
                   [placeholder]="el['placeholder']"
                   [ngClass]="el['cssClasses']" />
          </div>
        </ng-container>

        <!-- textarea -->
        <ng-container *ngSwitchCase="'textarea'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <textarea [id]="el['id']"
                      [formControlName]="el['formControlName'] || el['id']"
                      [placeholder]="el['placeholder']"
                      [ngClass]="el['cssClasses']"></textarea>
          </div>
        </ng-container>

        <!-- checkbox -->
        <ng-container *ngSwitchCase="'checkbox'">
          <div class="form-check mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <input type="checkbox" class="form-check-input"
                   [id]="el['id']" [formControlName]="el['formControlName'] || el['id']" />
            <label class="form-check-label" [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <div class="text-danger"
                 *ngIf="form.get(el['formControlName'] || el['id'])?.invalid &&
                        form.get(el['formControlName'] || el['id'])?.touched">
              {{ el['validationMessage'] || 'Required' }}
            </div>
          </div>
        </ng-container>

        <!-- radio -->
        <ng-container *ngSwitchCase="'radio'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label>{{ el['label'] }}</label>
            <div *ngFor="let opt of el['options']" class="form-check">
              <input type="radio" class="form-check-input"
                     [id]="el['id'] + '_' + opt" [value]="opt"
                     [formControlName]="el['formControlName'] || el['id']" />
              <label class="form-check-label" [for]="el['id'] + '_' + opt">{{ opt }}</label>
            </div>
          </div>
        </ng-container>

        <!-- toggle -->
        <ng-container *ngSwitchCase="'toggle'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label class="form-check-label">{{ el['label'] }}</label>
            <input type="checkbox" class="form-check-input"
                   [id]="el['id']" [formControlName]="el['formControlName'] || el['id']" />
          </div>
        </ng-container>

        <!-- dayMonthYear -->
        <ng-container *ngSwitchCase="'dayMonthYear'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label>
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <div [formGroupName]="el['formControlName'] || el['id']" class="d-flex gap-2">
              <input type="number" placeholder="Day" formControlName="day" class="form-control w-25" />
              <input type="number" placeholder="Month" formControlName="month" class="form-control w-25" />
              <input type="number" placeholder="Year" formControlName="year" class="form-control w-50" />
            </div>
          </div>
        </ng-container>

        <!-- monthYear -->
        <ng-container *ngSwitchCase="'monthYear'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label>
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <div [formGroupName]="el['formControlName'] || el['id']" class="d-flex gap-2">
              <input type="number" placeholder="Month" formControlName="month" class="form-control" />
              <input type="number" placeholder="Year" formControlName="year" class="form-control" />
            </div>
          </div>
        </ng-container>

        <!-- multiselect -->
        <ng-container *ngSwitchCase="'multiselect'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <select [id]="el['id']" multiple
                    [formControlName]="el['formControlName'] || el['id']"
                    class="form-select">
              <option *ngFor="let opt of el['options']" [value]="opt">{{ opt }}</option>
            </select>
          </div>
        </ng-container>

        <!-- date -->
        <ng-container *ngSwitchCase="'date'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <input type="date"
                   [id]="el['id']"
                   [formControlName]="el['formControlName'] || el['id']"
                   class="form-control" />
          </div>
        </ng-container>

        <!-- time -->
        <ng-container *ngSwitchCase="'time'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <input type="time"
                   [id]="el['id']"
                   [formControlName]="el['formControlName'] || el['id']"
                   class="form-control" />
          </div>
        </ng-container>

        <!-- datetime -->
        <ng-container *ngSwitchCase="'datetime'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <input type="datetime-local"
                   [id]="el['id']"
                   [formControlName]="el['formControlName'] || el['id']"
                   class="form-control" />
          </div>
        </ng-container>

        <!-- month (input type month) -->
        <ng-container *ngSwitchCase="'month'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <input type="month"
                   [id]="el['id']"
                   [formControlName]="el['formControlName'] || el['id']"
                   class="form-control" />
          </div>
        </ng-container>

        <!-- week -->
        <ng-container *ngSwitchCase="'week'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <input type="week"
                   [id]="el['id']"
                   [formControlName]="el['formControlName'] || el['id']"
                   class="form-control" />
          </div>
        </ng-container>

        <!-- color -->
        <ng-container *ngSwitchCase="'color'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">{{ el['label'] }}</label>
            <input type="color"
                   [id]="el['id']"
                   [formControlName]="el['formControlName'] || el['id']"
                   class="form-control form-control-color" />
          </div>
        </ng-container>

        <!-- range -->
        <ng-container *ngSwitchCase="'range'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">{{ el['label'] }}</label>
            <input type="range"
                   [id]="el['id']"
                   [formControlName]="el['formControlName'] || el['id']"
                   class="form-range" />
          </div>
        </ng-container>

        <!-- yesno -->
        <ng-container *ngSwitchCase="'yesno'">
          <div class="mb-3" #yesnoContainer>
            <label>{{ el['label'] }}</label>
            <div class="form-check form-check-inline">
              <input #yesInput type="radio" class="form-check-input"
                     [id]="el['id'] + '_yes'" value="yes"
                     [formControlName]="el['formControlName'] || el['id']"
                     (change)="onYesNoChange(el, 'yes')" />
              <label class="form-check-label" [for]="el['id'] + '_yes'">Yes</label>
            </div>
            <div class="form-check form-check-inline">
              <input #noInput type="radio" class="form-check-input"
                     [id]="el['id'] + '_no'" value="no"
                     [formControlName]="el['formControlName'] || el['id']"
                     (change)="onYesNoChange(el, 'no')" />
              <label class="form-check-label" [for]="el['id'] + '_no'">No</label>
            </div>
            <!-- Рендеринг вложенных элементов при выборе 'Yes' -->
            <div *ngIf="yesNoStates[el['formControlName'] || el['id']] === 'yes'" #yesSubElements>
              <ng-container *ngFor="let subEl of el['subElements']">
                <ng-container [ngSwitch]="subEl.type">
                  <!-- textbox -->
                  <ng-container *ngSwitchCase="'textbox'">
                    <div class="mb-3" #textboxContainer *ngIf="form.get(subEl['formControlName'])">
                      <label>{{ subEl['label'] }}</label>
                      <input #textboxInput type="text" class="form-control"
                             [id]="subEl['id']"
                             [formControlName]="subEl['formControlName']" />
                    </div>
                  </ng-container>
                  <!-- password -->
                  <ng-container *ngSwitchCase="'password'">
                    <div class="mb-3" #passwordContainer *ngIf="form.get(subEl['formControlName'])">
                      <label>{{ subEl['label'] }}</label>
                      <input #passwordInput type="password" class="form-control"
                             [id]="subEl['id']"
                             [formControlName]="subEl['formControlName']" />
                    </div>
                  </ng-container>
                  <!-- textarea -->
                  <ng-container *ngSwitchCase="'textarea'">
                    <div class="mb-3" #textareaContainer *ngIf="form.get(subEl['formControlName'])">
                      <label>{{ subEl['label'] }}</label>
                      <textarea #textareaInput class="form-control"
                                [id]="subEl['id']"
                                [formControlName]="subEl['formControlName']"></textarea>
                    </div>
                  </ng-container>
                  <!-- checkbox -->
                  <ng-container *ngSwitchCase="'checkbox'">
                    <div class="mb-3 form-check" #checkboxContainer *ngIf="form.get(subEl['formControlName'])">
                      <input #checkboxInput type="checkbox" class="form-check-input"
                             [id]="subEl['id']"
                             [formControlName]="subEl['formControlName']" />
                      <label class="form-check-label" [for]="subEl['id']">
                        {{ subEl['label'] }}
                      </label>
                    </div>
                  </ng-container>
                  <!-- radio -->
                  <ng-container *ngSwitchCase="'radio'">
                    <div class="mb-3" #radioContainer *ngIf="form.get(subEl['formControlName'])">
                      <label>{{ subEl['label'] }}</label>
                      <div *ngFor="let option of subEl['options']" class="form-check">
                        <input #radioInput type="radio" class="form-check-input"
                               [id]="subEl['id'] + '_' + option"
                               [value]="option"
                               [formControlName]="subEl['formControlName']" />
                        <label class="form-check-label" [for]="subEl['id'] + '_' + option">
                          {{ option }}
                        </label>
                      </div>
                    </div>
                  </ng-container>
                  <!-- toggle -->
                  <ng-container *ngSwitchCase="'toggle'">
                    <div class="mb-3 form-check form-switch" #toggleContainer *ngIf="form.get(subEl['formControlName'])">
                      <input #toggleInput type="checkbox" class="form-check-input"
                             [id]="subEl['id']"
                             [formControlName]="subEl['formControlName']" />
                      <label class="form-check-label" [for]="subEl['id']">
                        {{ subEl['label'] }}
                      </label>
                    </div>
                  </ng-container>
                  <!-- dropdown -->
                  <ng-container *ngSwitchCase="'dropdown'">
                    <div class="mb-3" #dropdownContainer *ngIf="form.get(subEl['formControlName'])">
                      <label>{{ subEl['label'] }}</label>
                      <select #dropdownSelect class="form-select"
                              [id]="subEl['id']"
                              [formControlName]="subEl['formControlName']">
                        <option *ngFor="let option of subEl['options']" [value]="option">
                          {{ option }}
                        </option>
                      </select>
                    </div>
                  </ng-container>
                  <!-- multiselect -->
                  <ng-container *ngSwitchCase="'multiselect'">
                    <div class="mb-3" #multiselectContainer *ngIf="form.get(subEl['formControlName'])">
                      <label>{{ subEl['label'] }}</label>
                      <select #multiselectSelect class="form-select"
                              [id]=\"subEl['id']\"
                              [formControlName]=\"subEl['formControlName']\"
                              multiple>
                        <option *ngFor=\"let option of subEl['options']\" [value]=\"option\">
                          {{ option }}
                        </option>
                      </select>
                    </div>
                  </ng-container>
                  <!-- date -->
                  <ng-container *ngSwitchCase=\"'date'\">\n                    <div class=\"mb-3\" #dateContainer *ngIf=\"form.get(subEl['formControlName'])\">\n                      <label>{{ subEl['label'] }}</label>\n                      <input #dateInput type=\"date\" class=\"form-control\"\n                             [id]=\"subEl['id']\"\n                             [formControlName]=\"subEl['formControlName']\" />\n                    </div>\n                  </ng-container>\n                  <!-- time -->\n                  <ng-container *ngSwitchCase=\"'time'\">\n                    <div class=\"mb-3\" #timeContainer *ngIf=\"form.get(subEl['formControlName'])\">\n                      <label>{{ subEl['label'] }}</label>\n                      <input #timeInput type=\"time\" class=\"form-control\"\n                             [id]=\"subEl['id']\"\n                             [formControlName]=\"subEl['formControlName']\" />\n                    </div>\n                  </ng-container>\n                  <!-- datetime -->\n                  <ng-container *ngSwitchCase=\"'datetime'\">\n                    <div class=\"mb-3\" #datetimeContainer *ngIf=\"form.get(subEl['formControlName'])\">\n                      <label>{{ subEl['label'] }}</label>\n                      <input #datetimeInput type=\"datetime-local\" class=\"form-control\"\n                             [id]=\"subEl['id']\"\n                             [formControlName]=\"subEl['formControlName']\" />\n                    </div>\n                  </ng-container>\n                  <!-- month -->\n                  <ng-container *ngSwitchCase=\"'month'\">\n                    <div class=\"mb-3\" #monthContainer *ngIf=\"form.get(subEl['formControlName'])\">\n                      <label>{{ subEl['label'] }}</label>\n                      <input #monthInput type=\"month\" class=\"form-control\"\n                             [id]=\"subEl['id']\"\n                             [formControlName]=\"subEl['formControlName']\" />\n                    </div>\n                  </ng-container>\n                  <!-- week -->\n                  <ng-container *ngSwitchCase=\"'week'\">\n                    <div class=\"mb-3\" #weekContainer *ngIf=\"form.get(subEl['formControlName'])\">\n                      <label>{{ subEl['label'] }}</label>\n                      <input #weekInput type=\"week\" class=\"form-control\"\n                             [id]=\"subEl['id']\"\n                             [formControlName]=\"subEl['formControlName']\" />\n                    </div>\n                  </ng-container>\n                  <!-- dayMonthYear -->\n                  <ng-container *ngSwitchCase=\"'dayMonthYear'\">\n                    <div class=\"mb-3\" #dayMonthYearContainer *ngIf=\"form.get(subEl['formControlName'])\">\n                      <label>{{ subEl['label'] }}</label>\n                      <input #dayMonthYearInput type=\"text\" class=\"form-control\" placeholder=\"DD/MM/YYYY\"\n                             [id]=\"subEl['id']\"\n                             [formControlName]=\"subEl['formControlName']\" />\n                    </div>\n                  </ng-container>\n                  <!-- monthYear -->\n                  <ng-container *ngSwitchCase=\"'monthYear'\">\n                    <div class=\"mb-3\" #monthYearContainer *ngIf=\"form.get(subEl['formControlName'])\">\n                      <label>{{ subEl['label'] }}</label>\n                      <input #monthYearInput type=\"text\" class=\"form-control\" placeholder=\"MM/YYYY\"\n                             [id]=\"subEl['id']\"\n                             [formControlName]=\"subEl['formControlName']\" />\n                    </div>\n                  </ng-container>\n                  <!-- вложенный yesno -->\n                  <ng-container *ngSwitchCase=\"'yesno'\">\n                    <div class=\"mb-3\" #nestedYesnoContainer *ngIf=\"form.get(subEl['formControlName'])\">\n                      <label>{{ subEl['label'] }}</label>\n                      <div class=\"form-check form-check-inline\">\n                        <input #nestedYesInput type=\"radio\" class=\"form-check-input\"\n                               [id]=\"subEl['id'] + '_yes'\" value=\"yes\"\n                               [formControlName]=\"subEl['formControlName']\"\n                               (change)=\"onYesNoChange(subEl, 'yes')\" />\n                        <label class=\"form-check-label\" [for]=\"subEl['id'] + '_yes'\">Yes</label>\n                      </div>\n                      <div class=\"form-check form-check-inline\">\n                        <input #nestedNoInput type=\"radio\" class=\"form-check-input\"\n                               [id]=\"subEl['id'] + '_no'\" value=\"no\"\n                               [formControlName]=\"subEl['formControlName']\"\n                               (change)=\"onYesNoChange(subEl, 'no')\" />\n                        <label class=\"form-check-label\" [for]=\"subEl['id'] + '_no'\">No</label>\n                      </div>\n                    </div>\n                  </ng-container>\n                  <!-- New: heading -->\n                  <ng-container *ngSwitchCase=\"'heading'\">\n                    <div class=\"mb-3\" #headingContainer>\n                      <h1 [id]=\"subEl['id']\">{{ subEl['label'] }}</h1>\n                    </div>\n                  </ng-container>\n                  <!-- New: paragraph -->\n                  <ng-container *ngSwitchCase=\"'paragraph'\">\n                    <div class=\"mb-3\" #paragraphContainer>\n                      <p [id]=\"subEl['id']\">{{ subEl['label'] }}</p>\n                    </div>\n                  </ng-container>\n                  <!-- New: list -->\n                  <ng-container *ngSwitchCase=\"'list'\">\n                    <div class=\"mb-3\" #listContainer>\n                      <ul [id]=\"subEl['id']\">\n                        <li *ngFor=\"let item of subEl['items']\">{{ item }}</li>\n                      </ul>\n                    </div>\n                  </ng-container>\n                  <!-- New: button -->\n                  <ng-container *ngSwitchCase=\"'button'\">\n                    <div class=\"mb-3\" #buttonContainer>\n                      <button type=\"button\" class=\"btn btn-primary\"\n                              [id]=\"subEl['id']\"\n                              (click)=\"subEl['onClick'] && subEl['onClick']()\">\n                        {{ subEl['label'] }}\n                      </button>\n                    </div>\n                  </ng-container>\n                </ng-container>\n              </ng-container>\n            </div>\n          </div>\n        </ng-container>\n\n        <!-- signaturePad -->\n        <ng-container *ngSwitchCase=\"'signaturePad'\">\n          <div class=\"mb-3\">\n            <label>{{ el['label'] }}</label>\n            <div class=\"signature-pad\" [ngClass]=\"el['cssClasses']\"></div>\n          </div>\n        </ng-container>\n\n        <!-- tagInput -->\n        <ng-container *ngSwitchCase=\"'tagInput'\">\n          <div class=\"mb-3\">\n            <label>{{ el['label'] }}</label>\n            <input type=\"text\" [placeholder]=\"el['placeholder']\" class=\"form-control\" />\n          </div>\n        </ng-container>\n\n        <!-- По умолчанию -->\n        <ng-container *ngSwitchDefault>\n          <div class=\"alert alert-info\">\n            Unknown element type: {{ el['type'] }}\n          </div>\n        </ng-container>\n\n      </ng-container>\n    </ng-container>\n  `
})
export class PagenPageComponent {
  @Input() el: any;
  @Input() form: any;
  @Input() countryDropdownData: any;
  // Функция для получения списка штатов передается как Input.
  @Input() getStatesForSelectedCountry!: () => any[];
  // Обработчики, передаваемые из родительского компонента.
  @Input() onCountryChange!: (event: Event) => void;
  @Input() onCancel!: () => void;
  @Input() onEdit!: () => void;

  // Локальное состояние для yes/no
  yesNoStates: { [key: string]: string } = {};

  // Обработчик изменения состояния yes/no.
  onYesNoChange(el: any, value: string) {
    this.yesNoStates[el['formControlName'] || el['id']] = value;
  }
}
