import { Directive, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs'; 
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  AbstractControl
} from '@angular/forms';
import {
  DinFormJsonWorkerService,
  RequirementsData,
  FormComponentData,
  ElementData
} from '../../services/din-form-json-worker.service';

@Directive()
export abstract class BaseComponent implements OnInit {


  protected requirementsReady$ = new Subject<void>();
  // Обработанные данные, полученные из JSON
  processedData!: FormComponentData;

  // Форма может быть либо FormGroup (монорежим), либо FormArray (полиформа)
  form!: FormGroup | FormArray;

  // Флаги загрузки и сообщение об ошибке
  isLoading = true;
  errorMessage = '';

  // Состояния для yes/no элементов (ключ – имя контрола)
  yesNoStates: { [key: string]: string } = {};

  // Для работы с dropdown страны – запоминаем последнее выбранное значение по индексу
  private lastLoggedCountry: { [key: number]: string } = {};

  // Пагинация: текущая страница и список ключей страниц
  currentPage: string = 'pagen_0';
  pageKeys: string[] = [];

  /**
   * Название компонента, чтобы dinFormService знал, какие данные грузить из JSON.
   * Реализуется в наследниках (например, componentName = 'app-driver-training').
   */
  protected abstract componentName: string;

  constructor(
    protected dinFormService: DinFormJsonWorkerService,
    protected cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRequirements();
  }

  /**
   * Возвращает FormGroup для заданного индекса в FormArray либо сам FormGroup (если он один).
   */
  protected getFormGroupAt(index: number): FormGroup | null {
    if (this.form instanceof FormGroup) {
      return this.form;
    } else if (this.form instanceof FormArray) {
      if (this.form.length > index) {
        return this.form.at(index) as FormGroup;
      } else {
        console.error(
          `[BaseComponent] FormArray index ${index} is out of bounds. Length: ${this.form.length}`
        );
      }
    }
    return null;
  }

  /**
   * Возвращает FormGroup. Если форма — это массив, берёт выбранный элемент (если задан) или первый.
   */
  protected getFormGroup(): FormGroup | null {
    if (this.form instanceof FormGroup) {
      return this.form;
    } else if (this.form instanceof FormArray && this.form.length > 0) {
      const selectedIndex = (this as any).selectedIndex;
      if (
        selectedIndex !== undefined &&
        selectedIndex !== null &&
        this.form.length > selectedIndex
      ) {
        return this.form.at(selectedIndex) as FormGroup;
      }
      return this.form.at(0) as FormGroup;
    }
    return null;
  }

  /**
   * Рекурсивно удаляет из объекта поля со значением пустой строки, null или undefined.
   */
  protected pruneEmptyFields(obj: any): any {
    if (Array.isArray(obj)) {
      return obj
        .map(item => this.pruneEmptyFields(item))
        .filter(
          item => item !== undefined && item !== null && item !== ''
        );
    } else if (obj !== null && typeof obj === 'object') {
      const pruned: any = {};
      Object.keys(obj).forEach(key => {
        const value = this.pruneEmptyFields(obj[key]);
        if (value !== '' && value !== null && value !== undefined) {
          pruned[key] = value;
        }
      });
      return pruned;
    }
    return obj;
  }

  /**
   * Обработка переключения yes/no.
   * При выборе "yes" динамически добавляются подэлементы (subElements),
   * при выборе "no" – удаляются.
   */
  onYesNoChange(el: ElementData, value: string, index: number = 0): void {
    const controlName = el.formControlName || el.id;
    this.yesNoStates[controlName] = value;
    const formGroup = this.getFormGroupAt(index);
    if (!formGroup) {
      console.error(
        `[BaseComponent] No FormGroup found for index ${index}`
      );
      return;
    }
    formGroup.get(controlName)?.setValue(value, { emitEvent: false });
    if (el.subElements) {
      if (value === 'yes') {
        el.subElements.forEach((subEl: ElementData) => {
          if (subEl.type === 'form' && subEl.formGroup) {
            if (!formGroup.contains(subEl.formGroup)) {
              const nestedForm = this.dinFormService.generateFormFromJson({
                id: subEl.id || 'auto_generated_id',
                type: 'form',
                elements: subEl.elements || []
              }) as FormGroup;
              formGroup.addControl(subEl.formGroup, nestedForm);
              //console.log([BaseComponent] Added nested form control "${subEl.formGroup}" at index ${index}`);
            }
          } else if (subEl.formControlName) {
            if (!formGroup.contains(subEl.formControlName)) {
              formGroup.addControl(
                subEl.formControlName,
                new FormControl('')
              );
              //console.log(
              //  `[BaseComponent] Added control "${subEl.formControlName}" at index ${index}`
              //);
            }
          }
        });
      } else if (value === 'no') {
        el.subElements.forEach((subEl: ElementData) => {
          if (
            subEl.formControlName &&
            formGroup.contains(subEl.formControlName)
          ) {
            formGroup.removeControl(subEl.formControlName);
            //console.log(
            //  `[BaseComponent] Removed control "${subEl.formControlName}" at index ${index}`
            //);
          }
          if (
            subEl.type === 'form' &&
            subEl.formGroup &&
            formGroup.contains(subEl.formGroup)
          ) {
            formGroup.removeControl(subEl.formGroup);
            //console.log(
            //  `[BaseComponent] Removed nested form control "${subEl.formGroup}" at index ${index}`
            //);
          }
        });
      }
    }
    this.cd.detectChanges();
  }

  /**
   * Загружает JSON-данные (requirements.json), берёт нужный компонент по имени, создаёт форму.
   * Если данные содержат pages, также обрабатываем логику пагинации.
   */
  protected loadRequirements(): void {
    this.dinFormService.loadRequirements('requirements.json').subscribe({
      next: (data: RequirementsData) => {
        const componentData =
          this.dinFormService.getComponentData(this.componentName);
        if (!componentData) {
          this.errorMessage = `No data found for component "${this.componentName}".`;
          this.isLoading = false;
          console.error(
            `[BaseComponent] No component data found for: ${this.componentName}`
          );
          return;
        }
        const vars = data.variables || {};
        const replaced = this.dinFormService.replaceTextVariablesInObject(
          componentData,
          vars
        );
        this.processedData = replaced as FormComponentData;
        let dataForForm = { ...this.processedData };
        if (this.processedData['pages']) {
          const flatElements =
            this.findArrayInObject(
              'elements',
              this.processedData['pages']
            ) ||
            this.findArrayInObject('rows', this.processedData['pages']);
          if (flatElements) {
            dataForForm = {
              ...this.processedData,
              elements: flatElements
            };
          }
        }
        if (this.processedData['pages']) {
          this.pageKeys = Object.keys(this.processedData['pages']);
          if (this.pageKeys.length > 0) {
            this.currentPage = this.pageKeys[0];
          }
        } else {
          this.pageKeys = [];
          this.currentPage = '';
        }
        this.form = this.dinFormService.generateFormFromJson(dataForForm);
        //console.log('[BaseComponent] Form created:', this.form);
        // Вывод начальных значений для отладки
        if (this.form instanceof FormArray) {
          for (let i = 0; i < this.form.length; i++) {
            this.initializeCountryAndState(i);
          }
        }
        this.isLoading = false;
        this.cd.detectChanges();
        this.requirementsReady$.next();
        this.requirementsReady$.complete(); 
      },
      error: (err) => {
        this.errorMessage = 'Failed to load data.';
        this.isLoading = false;
        console.error('[BaseComponent] Error loading requirements:', err);
      }
    });
  }

  /**
   * Инициализирует контролы "country" и "state" для заданного индекса (или для одиночной формы),
   * устанавливая значения из prefill (если они заданы) и корректируя state, если текущее значение не входит в список опций.
   */
  protected initializeCountryAndState(index: number = 0): void {
  const group = this.getFormGroupAt(index);
  if (!group) return;

  const prefillCountry = group.get('country')?.value;
  const prefillState = group.get('state')?.value;

  //console.log(`[BaseComponent] 🧭 initializeCountryAndState index=${index}`, {
  //  prefillCountry,
  //  prefillState,
  //  groupKeys: Object.keys(group.controls)
  //});

  // Если нет страны, пропускаем шаг
  if (!prefillCountry) {
    //console.log('[BaseComponent] Country is missing. Skipping state initialization.');
    this.cd.detectChanges();
    return;
  }

  // Устанавливаем страну в форму
  group.get('country')?.setValue(prefillCountry);
  const hasStates = this.countryDropdownData.stateOptions.hasOwnProperty(prefillCountry);
  //console.log(`[BaseComponent] Country "${prefillCountry}" ${hasStates ? 'HAS' : 'does NOT have'} states`);

  // Если для страны есть штаты, обновляем/добавляем их
  if (hasStates) {
    const stateOptions = this.countryDropdownData.stateOptions[prefillCountry];
    //console.log(`[BaseComponent] Available states for "${prefillCountry}":`, stateOptions);

    if (!group.contains('state')) {
      group.addControl('state', new FormControl(prefillState || ''));
      //console.log(`[BaseComponent] ➕ Added "state" control with value "${prefillState || ''}"`);
    } else {
      group.get('state')?.setValue(prefillState ?? '');
      //console.log(`[BaseComponent] ✏️ Updated "state" value: ${prefillState}`);
    }
  } else {
    if (group.contains('state')) {
      group.removeControl('state');
      //console.log(`[BaseComponent] ❌ Removed "state" control because "${prefillCountry}" has no states`);
    }
  }

  //console.log(`[BaseComponent] 🔹 Controls after init:`, Object.keys(group.controls));
  this.cd.detectChanges();
}



  /**
   * Возвращает FormGroup (или бросает ошибку, если не удалось получить).
   */
  get mainFormGroup(): FormGroup {
    const fg = this.getFormGroup();
    if (!fg) {
      throw new Error('FormGroup is not available.');
    }
    return fg;
  }

  /**
   * Возвращаем полную форму как есть (FormGroup или FormArray).
   */
  get fullForm(): FormGroup | FormArray {
    return this.form;
  }

  /**
   * Удобный геттер, если форма — FormArray.
   */
  get formArray(): FormArray {
    return this.form as FormArray;
  }

  get isFormGroup(): boolean {
    return this.fullForm instanceof FormGroup;
  }

  get isFormArray(): boolean {
    return this.fullForm instanceof FormArray;
  }

  /**
   * Отладочный метод для вывода типа контрола.
   */
  isFormOrArray(control: FormGroup | FormArray): boolean {
    //console.log('Control type:', control);
    return control instanceof FormGroup;
  }

  /**
   * Возвращает массив FormGroup, если форма — FormArray.
   */
  public get formGroups(): FormGroup[] {
    if (this.form instanceof FormArray) {
      return this.form.controls as FormGroup[];
    }
    return [];
  }

  /**
   * Поиск массива (key) в переданном объекте (obj).
   * Используется для поиска 'elements' или 'rows' при flatten страниц.
   */
  protected findArrayInObject(key: string, obj: any): any[] | null {
    if (!obj || typeof obj !== 'object') {
      return null;
    }
    if (Array.isArray(obj[key])) {
      return obj[key];
    }
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        const found = this.findArrayInObject(key, obj[prop]);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  /**
   * Текущие данные страницы для рендера (используется при многостраничной логике).
   */
  get currentPageData(): any {
    if (!this.processedData) {
      return {};
    }
    const pagesData =
      this.processedData['pages'] ||
      this.processedData['app-text-display'];
    if (pagesData && this.pageKeys.length > 0) {
      return pagesData[this.currentPage];
    }
    return this.processedData;
  }

  /**
   * Получаем массив 'rows' или 'elements' для текущей страницы (используется в шаблонах).
   */
  getRows(): any[] {
    const data = this.currentPageData;
    if (!data) {
      return [];
    }
    let rows = this.findArrayInObject('rows', data);
    if (rows) {
      return rows;
    }
    rows = this.findArrayInObject('elements', data);
    if (rows) {
      return rows;
    }
    return [];
  }

  getRowsForPage(pageKey: string): any[] {
    const pagesData =
      this.processedData['pages'] ||
      this.processedData['app-text-display'];
    const page = pagesData ? pagesData[pageKey] : null;
    if (!page) {
      return [];
    }
    let rows = this.findArrayInObject('rows', page);
    if (!rows) {
      rows = this.findArrayInObject('elements', page);
    }
    return rows || [];
  }

  /**
   * Переход на предыдущую страницу (для многостраничного режима).
   */
  goPrev(): void {
    const currentIndex = this.pageKeys.indexOf(this.currentPage);
    if (currentIndex > 0) {
      this.currentPage = this.pageKeys[currentIndex - 1];
    }
  }

  /**
   * Переход на следующую страницу (для многостраничного режима).
   */
  goNext(): void {
    if (!this.isProcessedPageValid()) {
      return;
    }
    const currentIndex = this.pageKeys.indexOf(this.currentPage);
    if (currentIndex < this.pageKeys.length - 1) {
      this.currentPage = this.pageKeys[currentIndex + 1];
    } else {
      if (this.isFormArray) {
        this.onSubmitFormArray();
      } else {
        this.onSubmitSingleForm();
      }
    }
  }

  /**
   * Методы, которые должны быть реализованы в наследующих компонентах.
   */
  abstract onCancel(): void;
  abstract onSubmitFormArray(): void;
  abstract onSubmitSingleForm(): void;

  // Геттеры для шаблона
  get processedElements(): any[] {
    return this.getRows();
  }

  get processedPageKeys(): string[] {
    return this.pageKeys;
  }

  get currentProcessedPage(): string {
    return this.currentPage;
  }

  getProcessedRowsForPage(pageKey: string): any[] {
    return this.getRowsForPage(pageKey);
  }

  goProcessedPrev(): void {
    this.goPrev();
  }

  goProcessedNext(): void {
    this.goNext();
  }

  /**
   * Проверка валидности текущей страницы.
   */
  isProcessedPageValid(): boolean {
    const group = this.getFormGroup();
    if (!group) {
      return false;
    }
    const rows = this.getRows();
    let valid = true;
    rows.forEach(row => {
      if (row.formControlName && group.contains(row.formControlName)) {
        const control = group.get(row.formControlName);
        if (control && control.invalid) {
          valid = false;
        }
      }
    });
    return valid;
  }

  /**
   * Геттер для countryDropdownData — чтобы шаблон имел доступ.
   */
  get countryDropdownData() {
    return this.dinFormService.getCountryDropdownData();
  }

  /**
   * Методы для обработки списка штатов/провинций и изменения страны в форме.
   */
  public getStatesHandler(i: number): () => string[] {
    return () => this.getStatesForSelectedCountry(i);
  }

  public getCountryChangeHandler(
    i: number
  ): (event: Event) => void {
    return (event: Event) => this.onCountryChange(event, i);
  }

  /**
   * Обработчик изменения страны: устанавливает значение контрола "country" и добавляет/удаляет контрол "state".
   */
  public onCountryChange = (event: Event, index: number): void => {
    const select = event.target as HTMLSelectElement;
    const selectedCountry = select.value.trim();
    if (this.lastLoggedCountry[index] !== selectedCountry) {
      //console.log(
      //  `[BaseComponent] onCountryChange triggered for index ${index}. Selected country: "${selectedCountry}"`
      //);
      this.lastLoggedCountry[index] = selectedCountry;
    }
    const group = this.getFormGroupAt(index);
    if (!group) {
      //console.error(
      //  `[BaseComponent] No FormGroup available in onCountryChange for index ${index}`
      //);
      return;
    }
    if (group.contains('country')) {
      group.get('country')?.setValue(selectedCountry);
      //console.log(
      //  `[BaseComponent] Set value for "country" control: ${selectedCountry}`
      //);
    } else {
      //console.error(
      //  `[BaseComponent] No "country" control found in group at index ${index}`
      //);
    }
    // Обновляем контрол "state" в зависимости от наличия опций для выбранной страны
    const hasStates =
      this.countryDropdownData.stateOptions.hasOwnProperty(selectedCountry);
    if (hasStates) {
      if (!group.contains('state')) {
        group.addControl(
          'state',
          new FormControl('', Validators.required)
        );
        //console.log(
        //  `[BaseComponent] Added "state" control with required validator for index ${index}`
        //);
      }
      const statesList =
        this.countryDropdownData.stateOptions[selectedCountry];
      const currentState = group.get('state')?.value;
      if (!statesList.includes(currentState)) {
        group.get('state')?.setValue('');
        //console.log(
        //  `[BaseComponent] Reset "state" control value because "${currentState}" is not in the list for "${selectedCountry}"`
        //);
      }
    } else {
      if (group.contains('state')) {
        group.removeControl('state');
        //console.log(
        //  `[BaseComponent] Removed "state" control for index ${index} because no states for "${selectedCountry}"`
        //);
      }
    }
    this.cd.detectChanges();
  };

  /**
   * Возвращает список штатов/провинций для выбранной страны.
   */
  public getStatesForSelectedCountry = (index: number): string[] => {
    const group = this.getFormGroupAt(index);
    if (!group) {
      //console.error(
      //  `[BaseComponent] No FormGroup available in getStatesForSelectedCountry for index ${index}`
      //);
      return [];
    }
    if (!group.contains('country')) {
      //console.error(
      //  `[BaseComponent] No "country" control found in FormGroup at index ${index}`
      //);
      return [];
    }
    let selectedCountry = group.get('country')?.value;
    //console.log(
    //  `[BaseComponent] getStatesForSelectedCountry: group value for index ${index}:`,
    //  group.value
    //);
    if (!selectedCountry) {
      return [];
    }
    selectedCountry = selectedCountry.trim();
    if (this.lastLoggedCountry[index] !== selectedCountry) {
      //console.log(
      //  `[BaseComponent] Selected country (index ${index}):`,
      //  selectedCountry
      //);
      this.lastLoggedCountry[index] = selectedCountry;
    }
    if (
      this.countryDropdownData.stateOptions.hasOwnProperty(
        selectedCountry
      )
    ) {
      const states =
        this.countryDropdownData.stateOptions[selectedCountry];
      //console.log(
      //  `[BaseComponent] Found states for index ${index}:`,
      //  states
      //);
      return states.length ? states : ['No states available'];
    } else {
      //console.log(
      //  `[BaseComponent] No state options for selected country "${selectedCountry}" at index ${index}`
      //);
      return [];
    }
  };

  /**
   * При отправке формы (submit) можно предварительно очистить payload от пустых полей,
   * чтобы в JSON не записывались ненужные пустые переменные.
   */
  protected preparePayload(rawValue: any): any {
    return this.pruneEmptyFields(rawValue);
  }
  protected removeOrphanControlsFromPayload(group: FormGroup, payload: any): any {
  const controlsInForm = Object.keys(group.controls);
  return Object.keys(payload).reduce((acc, key) => {
    if (controlsInForm.includes(key)) {
      acc[key] = payload[key];
    } else {
      console.log(`[BaseComponent] 🧹 Removed orphan field from payload: ${key}`);
    }
    return acc;
  }, {} as any);
}
}
