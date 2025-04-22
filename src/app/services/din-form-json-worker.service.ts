import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidatorFn,
  FormArray
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ElementType =
  | 'textbox'
  | 'password'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'dropdown'
  | 'multiselect'
  | 'date'
  | 'time'
  | 'datetime'
  | 'month'
  | 'week'
  | 'color'
  | 'range'
  | 'file'
  | 'dayMonthYear'
  | 'monthYear'
  | 'yesno'
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'button'
  | 'form'
  | 'row'
  | 'column'
  | 'signaturePad'
  | 'toggle'
  | 'tagInput'
  | 'countryDropdown';

export interface RowData {
  type: 'row';
  cssClasses: string[];
  columns: ColumnData[];
}

export interface ColumnData {
  type: 'column';
  cssClasses: string[];
  elements: ElementData[];
}

export interface ElementData {
  id: string;
  type: ElementType;
  cssClasses: string[];
  label?: string;
  content?: string;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  validation?: string;
  validationMessage?: string;
  options?: string[];
  items?: string[];
  rows?: RowData[];
  elements?: ElementData[];
  subElements?: ElementData[];
  action?: {
    type: 'submit' | 'button' | 'reset' | 'edit';
    callback?: string;
  };
  formControlName?: string;
  formGroup?: string;
  description?: string;
  [key: string]: any;
}

export interface FormComponentData {
  id: string;
  type: 'form';
  formGroup?: string;
  submitAction?: string;
  elements: RowData[] | ElementData[];
  multiple?: boolean;
  [key: string]: any;
}

export interface RequirementsData {
  variables?: Record<string, any>;
  components?: Record<string, any>;
}

export interface CountryDropdown extends ElementData {
  type: 'countryDropdown';
  countries: string[];
  stateOptions: { [country: string]: string[] };
  stateLabel?: string;
}

const INPUT_TYPES: ElementType[] = [
  'textbox', 'password', 'textarea',
  'checkbox', 'radio', 'toggle',
  'dropdown', 'multiselect',
  'date', 'time', 'datetime', 'month', 'week',
  'color', 'range', 'file',
  'dayMonthYear', 'monthYear',
  'yesno', 'signaturePad', 'tagInput',
  'countryDropdown'
];

@Injectable({
  providedIn: 'root',
})
export class DinFormJsonWorkerService {
  private requirementsData: RequirementsData = {};
  private elementsCache = new Map<string, ElementData[]>();
  private readonly REQUIRED_CONTROLS = ['startDate', 'endDate', 'state', 'country'];

  private countryDropdownData: CountryDropdown = {
    id: 'countryDropdown1',
    type: 'countryDropdown',
    cssClasses: ['form-select', 'form-select-sm'],
    label: 'Country',
    formControlName: 'country',
    countries: [
      "United States", "Canada", "United Kingdom", "Germany", "France", "Italy",
      "Spain", "Australia", "Japan", "China", "India", "Brazil", "Mexico", "Russia",
      "South Korea", "Netherlands", "Sweden", "Norway", "Denmark", "Finland",
      "Switzerland", "Belgium", "Austria", "Ireland", "Portugal", "Greece",
      "Poland", "Czech Republic", "Hungary", "Turkey", "Saudi Arabia",
      "United Arab Emirates", "Israel", "Egypt", "South Africa", "Nigeria",
      "Argentina", "Chile", "Colombia", "Peru", "Venezuela", "New Zealand",
      "Singapore", "Malaysia", "Indonesia", "Thailand", "Vietnam", "Philippines",
      "Pakistan", "Bangladesh"
    ],
    stateOptions: {
      "United States": [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
        "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
        "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
        "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
        "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
        "New Hampshire", "New Jersey", "New Mexico", "New York",
        "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
        "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
        "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
        "West Virginia", "Wisconsin", "Wyoming"
      ],
      "Canada": [
        "Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba",
        "Saskatchewan", "Nova Scotia", "New Brunswick",
        "Newfoundland and Labrador", "Prince Edward Island"
      ],
      "Australia": [
        "New South Wales", "Victoria", "Queensland", "Western Australia",
        "South Australia", "Tasmania", "Northern Territory",
        "Australian Capital Territory"
      ],
      "India": [
        "Uttar Pradesh", "Maharashtra", "Bihar", "West Bengal", "Tamil Nadu",
        "Rajasthan", "Karnataka", "Gujarat", "Andhra Pradesh", "Odisha"
      ],
      "Mexico": [
        "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
        "Chiapas", "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato",
        "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos",
        "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo",
        "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas",
        "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
      ],
      "Brazil": [
        "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará",
        "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso",
        "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná",
        "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte",
        "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina",
        "São Paulo", "Sergipe", "Tocantins", "Distrito Federal"
      ]
    },
    stateLabel: "State/Province"
  };

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {}

  loadRequirements(jsonPath: string): Observable<RequirementsData> {
    return new Observable((observer) => {
      this.http.get<RequirementsData>(jsonPath).subscribe({
        next: (data) => {
          this.requirementsData = data;
          observer.next(data);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }

  getFullRequirements(): RequirementsData {
    return this.requirementsData;
  }

  getComponentData(componentName: string): any {
    return this.requirementsData.components?.[componentName] ?? null;
  }

  private getControlName(el: ElementData): string {
    if (el.type === 'countryDropdown') return el.formControlName || 'country';
    return el.formControlName || el.id;
  }

  private getUniqueControlName(baseName: string, controls: Record<string, AbstractControl>): string {
    let name = baseName;
    let counter = 1;
    while (controls.hasOwnProperty(name)) {
      name = `${baseName}_${counter}`;
      counter++;
    }
    return name;
  }

  private parseElementsRecursively(
    struct: any,
    result: ElementData[] = [],
    useCache: boolean = false
  ): ElementData[] {
    const cacheKey = useCache ? JSON.stringify(struct) : null;
    if (cacheKey && this.elementsCache.has(cacheKey)) {
      return [...this.elementsCache.get(cacheKey)!];
    }
    if (Array.isArray(struct)) {
      struct.forEach(item => this.parseElementsRecursively(item, result, useCache));
    } else if (struct && typeof struct === 'object') {
      this.processObjectStructure(struct, result, useCache);
    }
    if (cacheKey) {
      this.elementsCache.set(cacheKey, [...result]);
    }
    return result;
  }

  private processObjectStructure(struct: any, result: ElementData[], useCache: boolean) {
    if (struct.pages) {
      Object.values(struct.pages).forEach(page =>
        this.parseElementsRecursively(page, result, useCache)
      );
    }
    if (struct.type === 'row' && struct.columns) {
      struct.columns.forEach((col: any) =>
        this.parseElementsRecursively(col, result, useCache)
      );
    }
    if (struct.type === 'column' && struct.elements) {
      this.parseElementsRecursively(struct.elements, result, useCache);
    }
    if (struct.elements) {
      this.parseElementsRecursively(struct.elements, result, useCache);
    }
    if (struct.rows) {
      this.parseElementsRecursively(struct.rows, result, useCache);
    }
    if (struct.subElements) {
      this.parseElementsRecursively(struct.subElements, result, useCache);
    }
    if (INPUT_TYPES.includes(struct.type)) {
      result.push(struct);
    }
  }

  // Рекурсивная функция для поиска значения по ключу в вложенной структуре
  private findNestedValue(obj: any, key: string): any {
    if (obj !== null && typeof obj === 'object') {
      if (obj.hasOwnProperty(key)) {
        return obj[key];
      }
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          const result = this.findNestedValue(obj[prop], key);
          if (result !== undefined) {
            return result;
          }
        }
      }
    }
    return undefined;
  }

  generateSingleFormGroup(
    struct: any,
    options: { skipDefaults?: boolean; initialValues?: any; keepNulls?: boolean; } = {}
  ): FormGroup {
    const { skipDefaults = false, initialValues = {}, keepNulls = false } = options;
    const clonedValues = JSON.parse(JSON.stringify(initialValues));

    let structForForm = struct;
    if (struct["pages"]) {
      let flatElements: any[] = [];
      Object.keys(struct["pages"]).forEach(key => {
        const page = struct["pages"][key];
        if (page.elements && Array.isArray(page.elements)) {
          flatElements = flatElements.concat(page.elements);
        } else if (page.rows && Array.isArray(page.rows)) {
          flatElements = flatElements.concat(page.rows);
        }
      });
      structForForm = { ...struct, elements: flatElements };
    }

    const formElements = this.parseElementsRecursively(structForForm, [], false);
    const controls: Record<string, AbstractControl> = {};

    formElements.forEach(el => {
      const baseName = this.getControlName(el);
      const ctrlName = el.formControlName ? baseName : this.getUniqueControlName(baseName, controls);
      
      let startValue = clonedValues[ctrlName];
      if ((startValue === undefined || startValue === '') && !skipDefaults) {
        startValue = el.defaultValue;
      }
      if (startValue === null && !keepNulls) {
        startValue = '';
      }
      
      switch (el.type) {
        case 'dayMonthYear':
          controls[ctrlName] = this.fb.group({
            day: new FormControl(startValue?.day ?? ''),
            month: new FormControl(startValue?.month ?? ''),
            year: new FormControl(startValue?.year ?? ''),
          });
          break;
        case 'monthYear':
          controls[ctrlName] = this.fb.group({
            month: new FormControl(startValue?.month ?? ''),
            year: new FormControl(startValue?.year ?? ''),
          });
          break;
        case 'multiselect':
          controls[ctrlName] = new FormControl(Array.isArray(startValue) ? startValue : []);
          break;
        case 'countryDropdown':
          const controlName = this.getControlName(el);
          const stateName = el["stateControlName"] ?? 'state';
          const countryValue = clonedValues[controlName] ??
          this.findNestedValue(clonedValues, controlName) ?? '';
          const stateValue = clonedValues[stateName] ??
          this.findNestedValue(clonedValues, stateName) ?? '';

          controls[controlName] = new FormControl(countryValue);
          if (this.countryDropdownData.stateOptions.hasOwnProperty(countryValue)) {
            controls[stateName] = new FormControl(stateValue);
          }


          console.log(`Pre-fill country (${controlName}) value:`, countryValue);
          console.log(`Pre-fill state (${stateName}) value:`, stateValue);
          break;
        case 'yesno':
          // Если значение не найдено напрямую, пробуем найти его рекурсивно
          if (startValue === undefined || startValue === '') {
            const nestedValue = this.findNestedValue(clonedValues, ctrlName);
            if (nestedValue !== undefined) {
              startValue = nestedValue;
            }
          }
          let normalizedValue = startValue;
          // Если значение представлено объектом с полем "value", используем его
          if (typeof normalizedValue === 'object' && normalizedValue !== null && 'value' in normalizedValue) {
            normalizedValue = normalizedValue.value;
          }
          // Если значение boolean, преобразуем в строку "yes"/"no"
          if (typeof normalizedValue === 'boolean') {
            normalizedValue = normalizedValue ? 'yes' : 'no';
          } else if (typeof normalizedValue === 'string') {
            normalizedValue = normalizedValue.trim().toLowerCase();
          }
          // Если значение пустое после нормализации, устанавливаем значение по умолчанию "no"
          if (!normalizedValue) {
            normalizedValue = 'no';
          }
          console.log(`[DinFormJsonWorkerService] Normalizing yesno: original=${JSON.stringify(startValue)}, normalized=${normalizedValue}`);
          
          // Создаем пустую группу для yesno и добавляем контрол "value" и subElements
          const yesNoGroup = this.fb.group({}) as FormGroup<any>;
          yesNoGroup.addControl('value', new FormControl(normalizedValue));
          if (el.subElements) {
            el.subElements.forEach(subEl => {
              const subName = subEl.formControlName || subEl.id;
              const subValue = clonedValues[subName] ?? subEl.defaultValue ?? '';
              yesNoGroup.addControl(subName, new FormControl(subValue));
            });
          }
          controls[ctrlName] = yesNoGroup;
          break;
        default:
          controls[ctrlName] = new FormControl(startValue);
      }
    });

    return this.fb.group(controls);
  }

  generateFormFromJson(
    struct: FormComponentData,
    options: { skipDefaults?: boolean; initialValues?: any; keepNulls?: boolean; initialArray?: any[]; } = {}
  ): FormGroup | FormArray {
    if (struct.multiple) {
      const initialGroups = options.initialArray?.map((item: any) =>
        this.generateSingleFormGroup(struct, { ...options, initialValues: item })
      ) || [this.generateSingleFormGroup(struct, options)];
      return this.fb.array(initialGroups);
    }
    const formGroup = this.generateSingleFormGroup(struct, options);
    return formGroup;
  }

  private createFormArray(struct: FormComponentData, options: any): FormArray {
    const initialGroups = options.initialArray?.map((item: any) =>
      this.generateSingleFormGroup(struct, { ...options, initialValues: item })
    ) || [this.generateSingleFormGroup(struct, options)];
    return this.fb.array(initialGroups);
  }

  private buildValidators(el: ElementData, subField?: string): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (el.required) {
      validators.push(Validators.required);
    }
    const validationPattern = subField ? el[`${subField}Validation`] : el.validation;
    if (typeof validationPattern === 'string') {
      try {
        validators.push(Validators.pattern(new RegExp(validationPattern)));
      } catch (err) {
        // Логирование исключено для не критичных случаев
      }
    }
    return validators;
  }

  replaceTextVariablesInObject(struct: any, variables: Record<string, any>): any {
    if (Array.isArray(struct)) {
      return struct.map(item => this.replaceTextVariablesInObject(item, variables));
    }
    if (struct && typeof struct === 'object') {
      const clone: any = {};
      for (const key of Object.keys(struct)) {
        clone[key] = this.replaceTextVariablesInObject(struct[key], variables);
      }
      return clone;
    }
    if (typeof struct === 'string') {
      return struct.replace(/{{\s*(\w+)\s*}}/g, (_, varName) =>
        variables[varName]?.toString() ?? ''
      );
    }
    return struct;
  }

  getCountryDropdownData(): CountryDropdown {
    return this.countryDropdownData;
  }
}
