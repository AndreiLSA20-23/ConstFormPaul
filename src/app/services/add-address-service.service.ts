import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class AddAddressService {
  // Все страны
  private countries = [
  'United States',
  'Canada',
  'Mexico',
  'Germany',
  'France',
  'Italy',
  'United Kingdom',
  'Australia',
  'Spain',
  'Japan',
  'India',
  'China',
  'Russia',
  'Brazil',
  'South Africa',
  'Argentina',
  'Chile',
  'Colombia',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Poland',
  'Austria',
  'Belgium',
  'Switzerland',
  'Portugal',
  'Turkey',
  'New Zealand',
  'South Korea',
  'Thailand',
  'Malaysia',
  'Indonesia',
  'Saudi Arabia',
  'United Arab Emirates',
  'Egypt',
  'Nigeria',
  'Kenya',
  'Israel',
  'Singapore',
  'Vietnam',
  'Philippines',
];


  // Штаты США
  private USAStates = [
    'California',
    'Texas',
    'New York',
    'Florida',
    'Illinois',
    'Pennsylvania',
    'Ohio',
    'Georgia',
    'North Carolina',
    'Michigan',
    'New Jersey',
    'Virginia',
    'Washington',
    'Arizona',
    'Massachusetts',
    'Tennessee',
    'Indiana',
    'Missouri',
    'Maryland',
    'Wisconsin',
    'Colorado',
    'Minnesota',
    'South Carolina',
    'Alabama',
    'Louisiana',
    'Kentucky',
    'Oregon',
    'Oklahoma',
    'Connecticut',
    'Iowa',
    'Mississippi',
    'Arkansas',
    'Kansas',
    'Utah',
    'Nevada',
    'New Mexico',
    'Nebraska',
    'West Virginia',
    'Idaho',
    'Hawaii',
    'New Hampshire',
    'Montana',
    'Rhode Island',
    'Delaware',
    'South Dakota',
    'North Dakota',
    'Alaska',
    'Vermont',
    'Wyoming',
    'District of Columbia',
  ];

  constructor(private fb: FormBuilder) {}

  /**
   * Получение списка стран
   * @returns {string[]} Список стран
   */
  getCountries(): string[] {
    return this.countries;
  }

  /**
   * Получение списка штатов для выбранной страны
   * @param {string} country - Название страны
   * @returns {string[]} Список штатов или пустой массив
   */
  getStatesForCountry(country: string): string[] {
    return country === 'United States' ? this.USAStates : [];
  }

  /**
   * Создание формы для адреса
   * @returns {FormGroup} Реактивная форма
   */
  createAddressForm(): FormGroup {
    return this.fb.group({
      country: ['', Validators.required],
      state: ['', Validators.required], // Поле для штатов
      city: ['', Validators.required], // Поле для города
      addressLine1: ['', Validators.required], // Первая строка адреса
      addressLine2: [''], // Вторая строка адреса (необязательно)
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]], // ZIP код
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  /**
   * Метод для обновления штатов и сброса значений полей на основе страны
   * @param {FormGroup} form - Форма с полями для обновления
   */
  onCountryChangeForm(form: FormGroup): void {
    const country =
      form.get('country')?.value ||
      form.get('countrySchool')?.value ||
      form.get('countryMilit')?.value;

    if (country === 'United States') {
      form.get('state')?.setValidators(Validators.required);
      this.getStatesForCountry(country);
    } else {
      form.get('state')?.clearValidators();
    }

    const stateControls = [
      form.get('state'),
      form.get('stateSchool'),
      form.get('stateMilit'),
    ];

    stateControls.forEach((control) => {
      if (control) {
        control.reset();
        control.updateValueAndValidity();
      }
    });
  }

  /**
   * Обработка отправки формы
   * @param {FormGroup} form - Реактивная форма
   * @returns {any} Данные формы или сообщение об ошибке
   */
  onSubmit(form: FormGroup): any {
    if (form.valid) {
      return form.value;
    } else {
      console.error('Form is invalid', form.errors);
      return 'Form is invalid';
    }
  }
}
