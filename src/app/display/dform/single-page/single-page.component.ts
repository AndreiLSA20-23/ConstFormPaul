import { Component, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-single-page',
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
        <ng-container *ngSwitchCase="'countryDropdown'">
          <div class="row align-items-center mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <div class="col">
              <label for="countryDropdown_{{ el['id'] }}">
                {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
              </label>
              <select
                id="countryDropdown_{{ el['id'] }}"
                [formControlName]="el['formControlName'] || el['id']"
                class="form-select form-select-sm"
                (change)="onCountryChangeAndUpdate($event)"
              >
                <option value="">-- Select a country --</option>
                <option *ngFor="let country of countryDropdownData.countries" [value]="country">
                  {{ country }}
                </option>
              </select>
            </div>
            <div class="col" *ngIf="form.get('state')">
              <label for="state_{{ el['id'] }}">{{ countryDropdownData.stateLabel }}</label>
              <select
                id="state_{{ el['id'] }}"
                formControlName="state"
                class="form-select form-select-sm"
              >
                <option *ngFor="let state of currentStates" [value]="state">
                  {{ state }}
                </option>
              </select>
            </div>
          </div>
        </ng-container>
        <ng-container *ngSwitchCase="'heading'">
          <h1
            [ngClass]="el['cssClasses']"
            [innerHTML]="el['content'] || el['defaultValue'] || el['label']"
          ></h1>
        </ng-container>
        <ng-container *ngSwitchCase="'paragraph'">
          <p
            [ngClass]="el['cssClasses']"
            [innerHTML]="el['defaultValue'] || el['content']"
          ></p>
        </ng-container>
        <ng-container *ngSwitchCase="'list'">
          <div [ngClass]="el['cssClasses']">
            <div [innerHTML]="el['defaultValue']"></div>
            <ul>
              <li *ngFor="let item of el['items']" [innerHTML]="item"></li>
            </ul>
          </div>
        </ng-container>
        <ng-container *ngSwitchCase="'button'">
          <div>
            <button
              *ngIf="el['action']?.type === 'submit'"
              [ngClass]="el['cssClasses']"
              type="submit"
            >
              {{ el['label'] }}
            </button>
            <button
              *ngIf="el['action']?.type === 'button'"
              [ngClass]="el['cssClasses']"
              type="button"
              (click)="
                el['action']?.callback === 'onCancel'
                  ? onCancel()
                  : el['action']?.callback === 'onEdit'
                  ? onEdit()
                  : null
              "
            >
              {{ el['label'] }}
            </button>
          </div>
        </ng-container>
        
        <ng-container *ngSwitchCase="'textbox'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <input
              [id]="el['id']"
              type="text"
              [formControlName]="el['formControlName'] || el['id']"
              [placeholder]="el['placeholder']"
              [ngClass]="el['cssClasses']"
            />
            <div class="text-danger" *ngIf="form.get(el['formControlName'] || el['id'])?.invalid && form.get(el['formControlName'] || el['id'])?.touched">
              {{ el['validationMessage'] || 'Invalid input' }}
            </div>
          </div>
        </ng-container>
        <ng-container *ngSwitchCase="'textarea'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <textarea
              [id]="el['id']"
              [formControlName]="el['formControlName'] || el['id']"
              [placeholder]="el['placeholder']"
              [ngClass]="el['cssClasses']"
            ></textarea>
          </div>
        </ng-container>
        <ng-container *ngSwitchCase="'checkbox'">
          <div class="form-check mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <input
              type="checkbox"
              class="form-check-input"
              [id]="el['id']"
              [formControlName]="el['formControlName'] || el['id']"
            />
            <label class="form-check-label" [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <div class="text-danger" *ngIf="form.get(el['formControlName'] || el['id'])?.invalid && form.get(el['formControlName'] || el['id'])?.touched">
              {{ el['validationMessage'] || 'Required' }}
            </div>
          </div>
        </ng-container>
        <ng-container *ngSwitchCase="'radio'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label>{{ el['label'] }}</label>
            <div *ngFor="let opt of el['options']" class="form-check">
              <input
                type="radio"
                class="form-check-input"
                [id]="el['id'] + '_' + opt"
                [value]="opt"
                [formControlName]="el['formControlName'] || el['id']"
              />
              <label class="form-check-label" [for]="el['id'] + '_' + opt">{{ opt }}</label>
            </div>
          </div>
        </ng-container>
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
        <ng-container *ngSwitchCase="'dropdown'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <select
              [id]="el['id']"
              [formControlName]="el['formControlName'] || el['id']"
              [ngClass]="el['cssClasses']"
              class="form-select"
            >
              <option *ngFor="let opt of el['options']" [value]="opt">{{ opt }}</option>
            </select>
          </div>
        </ng-container>
        
        <ng-container *ngSwitchCase="'multiselect'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <select
              [id]="el['id']"
              multiple
              [formControlName]="el['formControlName'] || el['id']"
              class="form-select"
            >
              <option *ngFor="let opt of el['options']" [value]="opt">{{ opt }}</option>
            </select>
          </div>
        </ng-container>
        
        <ng-container *ngSwitchCase="'date'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <input
              type="date"
              [id]="el['id']"
              [formControlName]="el['formControlName'] || el['id']"
              class="form-control"
            />
          </div>
        </ng-container>

        <ng-container *ngSwitchCase="'datetime'">
          <div class="mb-3" *ngIf="form.get(el['formControlName'] || el['id'])">
            <label [for]="el['id']">
              {{ el['label'] }}<span *ngIf="el['required']" class="text-danger">*</span>
            </label>
            <input
              type="datetime-local"
              [id]="el['id']"
              [formControlName]="el['formControlName'] || el['id']"
              class="form-control"
            />
          </div>
        </ng-container>
       
        <ng-container *ngSwitchCase="'yesno'">
          <div class="mb-3" #yesnoContainer *ngIf="form.get(el['formControlName'] || el['id']) as yesnoGroup">
            <div [formGroup]="yesnoGroup">
              <label>{{ el['label'] }}</label>
              <div class="form-check">
                <input
                  #yesInput
                  type="radio"
                  class="form-check-input"
                  [id]="el['id'] + '_yes'"
                  value="yes"
                  formControlName="value"
                  (change)="onYesNoChange(el, 'yes')"
                />
                <label class="form-check-label" [for]="el['id'] + '_yes'">Yes</label>
              </div>
              <div class="form-check">
                <input
                  #noInput
                  type="radio"
                  class="form-check-input"
                  [id]="el['id'] + '_no'"
                  value="no"
                  formControlName="value"
                  (change)="onYesNoChange(el, 'no')"
                />
                <label class="form-check-label" [for]="el['id'] + '_no'">No</label>
              </div>
              <div *ngIf="yesnoGroup.get('value')?.value === 'yes'" class="vertical-radio-group" #yesSubElements>
                <ng-container *ngFor="let subEl of el['subElements']">
                  <ng-container [ngSwitch]="subEl.type">
                    <ng-container *ngSwitchCase="'textbox'">
                      <div class="mb-3" *ngIf="yesnoGroup.get(subEl['formControlName'] || subEl['id'])">
                        <label>{{ subEl['label'] }}</label>
                        <input
                          type="text"
                          class="form-control"
                          [id]="subEl['id']"
                          [formControlName]="subEl['formControlName'] || subEl['id']"
                        />
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'textarea'">
                      <div class="mb-3" *ngIf="yesnoGroup.get(subEl['formControlName'] || subEl['id'])">
                        <label>{{ subEl['label'] }}</label>
                        <textarea
                          class="form-control"
                          [id]="subEl['id']"
                          [formControlName]="subEl['formControlName'] || subEl['id']"
                        ></textarea>
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'checkbox'">
                      <div class="mb-3 form-check" *ngIf="yesnoGroup.get(subEl['formControlName'] || subEl['id'])">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          [id]="subEl['id']"
                          [formControlName]="subEl['formControlName'] || subEl['id']"
                        />
                        <label class="form-check-label" [for]="subEl['id']">
                          {{ subEl['label'] }}
                        </label>
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'radio'">
                      <div class="mb-3" *ngIf="yesnoGroup.get(subEl['formControlName'] || subEl['id'])">
                        <label>{{ subEl['label'] }}</label>
                        <div *ngFor="let option of subEl['options']" class="form-check">
                          <input
                            type="radio"
                            class="form-check-input"
                            [id]="subEl['id'] + '_' + option"
                            [value]="option"
                            [formControlName]="subEl['formControlName'] || subEl['id']"
                          />
                          <label class="form-check-label" [for]="subEl['id'] + '_' + option">
                            {{ option }}
                          </label>
                        </div>
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'dropdown'">
                      <div class="mb-3" *ngIf="yesnoGroup.get(subEl['formControlName'] || subEl['id'])">
                        <label>{{ subEl['label'] }}</label>
                        <select
                          [id]="subEl['id']"
                          [formControlName]="subEl['formControlName'] || subEl['id']"
                          class="form-select"
                        >
                          <option *ngFor="let option of subEl['options']" [value]="option">
                            {{ option }}
                          </option>
                        </select>
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'multiselect'">
                      <div class="mb-3" *ngIf="yesnoGroup.get(subEl['formControlName'] || subEl['id'])">
                        <label>{{ subEl['label'] }}</label>
                        <select
                          [id]="subEl['id']"
                          multiple
                          [formControlName]="subEl['formControlName'] || subEl['id']"
                          class="form-select"
                        >
                          <option *ngFor="let option of subEl['options']" [value]="option">
                            {{ option }}
                          </option>
                        </select>
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'date'">
                      <div class="mb-3" *ngIf="yesnoGroup.get(subEl['formControlName'] || subEl['id'])">
                        <label>{{ subEl['label'] }}</label>
                        <input
                          type="date"
                          [id]="subEl['id']"
                          [formControlName]="subEl['formControlName'] || subEl['id']"
                          class="form-control"
                        />
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'datetime'">
                      <div class="mb-3" *ngIf="yesnoGroup.get(subEl['formControlName'] || subEl['id'])">
                        <label>{{ subEl['label'] }}</label>
                        <input
                          type="datetime-local"
                          [id]="subEl['id']"
                          [formControlName]="subEl['formControlName'] || subEl['id']"
                          class="form-control"
                        />
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'dayMonthYear'">
                      <div class="mb-3" *ngIf="yesnoGroup.get(subEl['formControlName'] || subEl['id'])">
                        <label>{{ subEl['label'] }}</label>
                        <input
                          type="text"
                          class="form-control"
                          placeholder="DD/MM/YYYY"
                          [id]="subEl['id']"
                          [formControlName]="subEl['formControlName'] || subEl['id']"
                        />
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'yesno'">
                      <div class="mb-3" *ngIf="yesnoGroup.get(subEl['formControlName'] || subEl['id'])">
                        <label>{{ subEl['label'] }}</label>
                        <div class="form-check form-check-inline">
                          <input
                            type="radio"
                            class="form-check-input"
                            [id]="subEl['id'] + '_yes'"
                            value="yes"
                            [formControlName]="subEl['formControlName'] || subEl['id']"
                            (change)="onYesNoChange(subEl, 'yes')"
                          />
                          <label class="form-check-label" [for]="subEl['id'] + '_yes'">Yes</label>
                        </div>
                        <div class="form-check form-check-inline">
                          <input
                            type="radio"
                            class="form-check-input"
                            [id]="subEl['id'] + '_no'"
                            value="no"
                            [formControlName]="subEl['formControlName'] || subEl['id']"
                            (change)="onYesNoChange(subEl, 'no')"
                          />
                          <label class="form-check-label" [for]="subEl['id'] + '_no'">No</label>
                        </div>
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'heading'">
                      <div class="mb-3">
                        <h1 [id]="subEl['id']">{{ subEl['label'] }}</h1>
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'paragraph'">
                      <div class="mb-3">
                        <p [id]="subEl['id']">{{ subEl['label'] }}</p>
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'list'">
                      <div class="mb-3">
                        <ul [id]="subEl['id']">
                          <li *ngFor="let item of subEl['items']">{{ item }}</li>
                        </ul>
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'button'">
                      <div class="mb-3">
                        <button
                          type="button"
                          class="btn btn-primary"
                          [id]="subEl['id']"
                          (click)="subEl['onClick'] && subEl['onClick']()"
                        >
                          {{ subEl['label'] }}
                        </button>
                      </div>
                    </ng-container>
                  </ng-container>
                </ng-container>
              </div>
            </div>
          </div>
        </ng-container>
        
        <ng-container *ngSwitchDefault>
          <div class="alert alert-info">
            Unknown element type: {{ el['type'] }}
          </div>
        </ng-container>
        
      </ng-container>
    </ng-container>
  `
})
export class SinglePageComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() el: any;
  @Input() form: any; // FormGroup или FormArray
  @Input() countryDropdownData: any;
  @Input() getStatesForSelectedCountry!: () => any[];
  @Input() onCountryChange!: (event: Event) => void;
  @Input() onCancel!: () => void;
  @Input() onEdit!: () => void;

  yesNoStates: { [key: string]: string } = {};
  currentStates: string[] = [];
  private yesnoSub?: Subscription;

  ngOnInit(): void {
    setTimeout(() => {
      const ctrlName = this.el?.formControlName || this.el?.id;
      if (!ctrlName || !this.form) return;

      const ctrl = this.form.get(ctrlName);
      if (!ctrl) {
        //console.warn(`[SinglePageComponent] Контрол '${ctrlName}' не найден в форме.`);
        return;
      }

      const rawVal = ctrl.value;
      let normalizedVal: string = '';
      if (typeof rawVal === 'object' && rawVal !== null && 'value' in rawVal) {
        normalizedVal = String(rawVal.value).toLowerCase();
      } else if (typeof rawVal === 'string') {
        normalizedVal = rawVal.toLowerCase();
      }

      if (this.el?.type === 'countryDropdown') {
        const selectedCountry = this.form.get(ctrlName)?.value;
        this.currentStates = this.getStatesForSelectedCountry();

        //console.log(`[SinglePageComponent] 🌍 Init countryDropdown "${ctrlName}" value="${selectedCountry}"`);
        //console.log(`[SinglePageComponent] ⛳ Initial state options:`, this.currentStates);

        const stateCtrl = this.form.get('state');
        if (stateCtrl) {
          //console.log(`[SinglePageComponent] 📝 Current "state" control value:`, stateCtrl.value);
          //console.log(`[SinglePageComponent] 🧩 "state" control options length:`, this.currentStates.length);
          //console.log(`[SinglePageComponent] 🧩 "state" control exists in form:`, true);
        } else {
          //console.log(`[SinglePageComponent] ⚠️ "state" control not found in form.`);
        }
      }

      if (normalizedVal === 'yes' || normalizedVal === 'no') {
        this.yesNoStates[ctrlName] = normalizedVal;
      }

      this.yesnoSub = ctrl.valueChanges.subscribe((value: any) => {
        let newVal: string = '';
        if (typeof value === 'object' && value !== null && 'value' in value) {
          newVal = String(value.value).toLowerCase();
        } else if (typeof value === 'string') {
          newVal = value.toLowerCase();
        }
        if (newVal === 'yes' || newVal === 'no') {
          this.yesNoStates[ctrlName] = newVal;
          //console.log(`[SinglePageComponent] ✅ yesno changed: ${ctrlName} = ${newVal}`);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    if (this.el?.type === 'countryDropdown') {
      const ctrlName = this.el?.formControlName || this.el?.id;
      this.currentStates = this.getStatesForSelectedCountry();

      setTimeout(() => {
        const stateCtrl = this.form.get('state');
        if (stateCtrl) {
          //console.log(`[SinglePageComponent] 📝 [ngAfterViewInit] "state" control value:`, stateCtrl.value);
          //console.log(`[SinglePageComponent] 🧪 [ngAfterViewInit] Available states:`, this.currentStates);
        } else {
          //console.warn(`[SinglePageComponent] ⚠️ [ngAfterViewInit] "state" control not found in form.`);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.yesnoSub) {
      this.yesnoSub.unsubscribe();
    }
  }

  onCountryChangeAndUpdate(event: Event) {
    this.onCountryChange(event);
    this.currentStates = this.getStatesForSelectedCountry();
    //console.log('[SinglePageComponent] 🔄 Страна изменена, штаты обновлены:', this.currentStates);

    const stateCtrl = this.form.get('state');
    if (stateCtrl) {
      //console.log('[SinglePageComponent] 🔎 Текущее значение контрола "state":', stateCtrl.value);
    } else {
      //console.warn('[SinglePageComponent] ⚠️ Контрол "state" не найден в форме.');
    }
  }

  onYesNoChange(el: any, value: string) {
    const ctrlName = el?.formControlName || el?.id;
    this.yesNoStates[ctrlName] = value;
  }
}



