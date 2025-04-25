import {
  Component,
  Input,
  OnInit,
  Inject,
  Optional,
  PLATFORM_ID,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import {
  isPlatformBrowser,
  NgIf,
  NgForOf,
  NgClass,
  NgStyle,
  NgTemplateOutlet
} from '@angular/common';
import { BaseComponent } from '../../base/base/base.component';
import {
  DinFormJsonWorkerService,
  ElementData
} from '../../services/din-form-json-worker.service';
import { FormDataService } from '../../services/formdata.service';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import {
  ReactiveFormsModule,
  FormGroup,
  FormArray,
  FormsModule,
  FormBuilder,
  AbstractControl,
  FormControl
} from '@angular/forms';
import { CpipSummaryPipe } from './cpip-summary.pipe';
import { SinglePageComponent } from './single-page/single-page.component';
import { PagenPageComponent } from './pagen-page/pagen-page.component';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dform',
  templateUrl: './dform.component.html',
  styleUrls: ['./dform.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    NgForOf,
    NgClass,
    NgStyle,
    NgTemplateOutlet,
    PagenPageComponent,
    SinglePageComponent,
    CpipSummaryPipe
  ]
})
export class DformComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() override componentName!: string;

  public ssn: string = '';
  public bday: string = '';
  public maxItems: number = 15;
  public isEditing: boolean = false;
  public selectedIndex: number | null = null;
  public isSurveySaved: boolean = false;
  public isSingleFormView: boolean = true;

  public editForm!: FormGroup; // Форма для редактирования элемента (FormArray)
  private editFormBackup: any = null;
  private editFormSubscription: Subscription | null = null;
  private fallbackTimer: any;

  // Защита от повторной инициализации, если компонент монтируется заново
  private isInitialized = false;
  isReady = false;

  constructor(
    @Inject(DinFormJsonWorkerService) dinFormService: DinFormJsonWorkerService,
    cd: ChangeDetectorRef,
    private formDataService: FormDataService,
    private http: HttpClient,
    private fb: FormBuilder,
    private toastr: ToastrService,
    @Optional() @Inject('ssn') ssnToken: string,
    @Optional() @Inject('bday') bdayToken: string,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(dinFormService, cd);

    // Инициализация ssn/bday (если на клиенте)
    if (isPlatformBrowser(this.platformId)) {
      this.ssn = ssnToken || localStorage.getItem('currentUserSSN') || '';
      this.bday = bdayToken || localStorage.getItem('currentUserBday') || '';
    } else {
      this.ssn = ssnToken || '';
      this.bday = bdayToken || '';
    }

    // Пустая форма (для редактирования конкретного элемента FormArray)
    this.editForm = this.fb.group({});
  }

  override ngOnInit(): void {
    if (!this.componentName) {
      console.error('[DformComponent] Component name is not provided.');
      return;
    }

    // Если уже инициализировали этот компонент (при повторном создании), не повторяем
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;

    // 1) Загружаем JSON-схему (BaseComponent подтянет и создаст this.form)
    this.loadRequirements();

    // 2) Подгружаем префилл данных — слегка откладываем, чтобы форма успела создаться
    //setTimeout(() => {
    //  this.loadPrefillData();
    //}, 0);
    this.requirementsReady$
      .pipe(take(1))               // берём событие один раз
      .subscribe(() => this.loadPrefillData());
  }



private loadPrefillData(): void {
  /* ---------- 0. SSN обязателен ---------- */
  if (!this.ssn) {
    console.error('[DformComponent] Prefill: SSN not found.');
    return;
  }

  const url = `http://64.251.23.111:8000/api/form-data/${this.componentName}/${this.ssn}`;

  /* ---------- 1. fallback-таймер 10 с ---------- */
  this.fallbackTimer = setTimeout(() => {
    console.warn('[DformComponent] Prefill timeout – blank form shown');
    this.isReady = true;
    this.cd.detectChanges();
  }, 10_000);

  /* ---------- 2. запрос ---------- */
  this.http.get<{ data?: any }>(url).subscribe({
    next: ({ data }) => {
      clearTimeout(this.fallbackTimer);

      /* 2-a. пустой ответ ⇒ новая анкета */
      if (!data) {
        this.isReady = true;
        this.cd.detectChanges();
        return;
      }

      /* ---------- 3. одиночная форма ---------- */
      if (this.form instanceof FormGroup) {

        /* 3-a. контрол state должен существовать ДО patchValue */
        if (!this.form.contains('state')) {
          this.form.addControl('state', new FormControl(''));
        }

        /* 3-b. кладём префилл за один шаг */
        this.form.patchValue(data);

        /* 3-c. приводим country/state в порядок */
        this.initializeCountryAndState();

        this.cd.detectChanges();
        this.isReady = true;
        return;
      }

      /* ---------- 4. FormArray (менеджер) ---------- */
      if (this.form instanceof FormArray) {
        const items: any[] = Array.isArray(data.items) ? data.items : [];

        /* 4-a. очищаем массив */
        this.form.clear();                             // Angular ≥17

        /* 4-b. добавляем элементы с инициализацией */
        items.forEach((item, idx) => {
          const fg = this.dinFormService.generateSingleFormGroup(
                      this.processedData,
                      { skipDefaults: false, initialValues: item });
          (this.form as FormArray).push(fg);
          this.initializeCountryAndState(idx);
        });

        this.isSingleFormView = items.length === 0;
        this.isSurveySaved    = items.length > 0;
        this.cd.detectChanges();
        this.isReady = true;
      }
    },

    error: err => {
      clearTimeout(this.fallbackTimer);
      console.error('[DformComponent] Prefill error:', err);
      this.isReady = true;
      this.cd.detectChanges();
    }
  });
}



  // ----------------------------------------------------------------------------
  // Методы для FormArray / редактирования/удаления, без изменений
  // ----------------------------------------------------------------------------

  override onYesNoChange(el: ElementData, value: string): void {
    // Если у нас FormArray и выбран элемент – используем selectedIndex
    const index = (this.form instanceof FormArray && this.selectedIndex !== null)
      ? this.selectedIndex
      : 0;
    super.onYesNoChange(el, value, index);
  }

  onAddNewItem(): void {
    if (!(this.form instanceof FormArray)) {
      console.warn('[DformComponent] onAddNewItem called but form is not a FormArray.');
      return;
    }
    //console.log('[DformComponent] onAddNewItem called. Current length:', this.form.length);

    if (this.form.length < this.maxItems) {
      if (!this.isSurveySaved) {
        this.toastr.warning('Please save the current survey before adding a new one.');
        return;
      }
      // Создаем новый FormGroup из JSON-схемы
      const newGroup = this.dinFormService.generateSingleFormGroup(this.processedData, {
        skipDefaults: false,
        initialValues: {}
      });
      (this.form as FormArray).push(newGroup);

      this.selectedIndex = this.form.length - 1;
      this.isSurveySaved = false;
      this.toastr.success('New survey added successfully.');
      this.cd.detectChanges();
    } else {
      this.toastr.warning('Maximum number of surveys reached.');
    }
  }

  onEditItem(index: number): void {
    //console.log('[DformComponent] onEditItem called with index:', index);
    this.selectedIndex = index;
    this.isEditing = true;

    if (!(this.form instanceof FormArray)) {
      console.warn('[DformComponent] onEditItem called but form is not a FormArray.');
      return;
    }
    const formArray = this.form as FormArray;
    const currentGroup = formArray.at(index) as FormGroup;

    // Генерируем новую группу с учётом возможных полей
    const regenerated = this.dinFormService.generateSingleFormGroup(this.processedData, {
      skipDefaults: false,
      initialValues: currentGroup.value
    });

    // Заменяем текущий элемент
    formArray.setControl(index, regenerated);

    // Сохраняем бэкап на случай Cancel
    this.editFormBackup = JSON.parse(JSON.stringify(currentGroup.value));
    this.editForm = regenerated;

    // Подписка на изменения
    this.editFormSubscription?.unsubscribe();
    this.editFormSubscription = this.editForm.valueChanges.subscribe((newVal: any) => {
      console.warn('[DformComponent] Edit form changes - Index:', index, ', New value:', newVal);
    });

    this.cd.detectChanges();
  }

  onDeleteItem(index: number): void {
  // …ваша текущая проверка индексов…
  const formArray = this.form as FormArray;
  formArray.removeAt(index);

  // сразу сбрасываем selectedIndex и выходим из режима редактирования
  this.exitEditing();

  // собираем payload
  const payload = {
    ssn: this.ssn,
    bday: this.bday,
    items: formArray.value
  };

  // отправляем на сервер
  this.formDataService.createFormData(this.componentName, payload).subscribe({
    next: () => {
      this.toastr.success('Survey deleted successfully.');
      this.isSurveySaved = true;
      this.cd.detectChanges();
    },
    error: err => {
      console.error('[DformComponent] delete persistence error', err);
      this.toastr.error('Failed to persist deletion.');
    }
  });
}


  onEditSubmit(): void {
    //console.log('[DformComponent] onEditSubmit(), selectedIndex:', this.selectedIndex);
    if (this.selectedIndex === null || this.editForm.invalid) {
      this.toastr.error('Form is invalid or no survey selected.');
      return;
    }

    const formArray = this.form as FormArray;
    const targetGroup = formArray.at(this.selectedIndex) as FormGroup;

    targetGroup.patchValue(this.editForm.value);
    this.editForm.markAsPristine();
    this.editFormBackup = null;
    this.exitEditing();
    this.cd.detectChanges();

    const payload = {
      ssn: this.ssn,
      bday: this.bday,
      items: formArray.value // вся коллекция
    };
    this.formDataService.createFormData(this.componentName, payload).subscribe({
      next: () => {
        this.toastr.success('Survey updated successfully.');
        this.isSurveySaved = true;
      },
      error: (error: any) => {
        console.error('[DformComponent] onEditSubmit error:', error);
        this.toastr.error('Failed to update survey.');
      }
    });
  }

  override onCancel(): void {
    if (!this.isSurveySaved && this.editForm.dirty && this.editFormBackup) {
      const confirmCancel = confirm('Discard changes?');
      if (confirmCancel) {
        this.editForm.patchValue(this.editFormBackup);
      }
    }
    this.exitEditing();
  }

  private exitEditing(): void {
    this.isEditing = false;
    this.selectedIndex = null;
    this.editFormSubscription?.unsubscribe();
    this.cd.detectChanges();
  }

  override onSubmitFormArray(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      this.toastr.error('Please fill all required fields.');
      return;
    }
    const formArray = this.form as FormArray;
    const payload = {
      ssn: this.ssn,
      bday: this.bday,
      items: formArray.value
    };
    this.formDataService.createFormData(this.componentName, payload).subscribe({
      next: () => {
        this.toastr.success('Form submitted successfully.');
        this.isSurveySaved = true;
      },
      error: (error: any) => {
        console.error('[DformComponent] onSubmitFormArray error:', error);
        this.toastr.error('Failed to submit form.');
      }
    });
  }

  override onSubmitSingleForm(): void {
  const group = this.getFormGroup() as FormGroup;
  if (!group || group.invalid) {
    this.markFormGroupTouched(group);
    this.toastr.error('Please fill all required fields.');
    return;
  }

  // ① очищаем payload от пустых/сиротских полей
  let payloadCore = this.preparePayload(group.value);
  payloadCore = this.removeOrphanControlsFromPayload(group, payloadCore);

  // ② если поле state исчезло (страна без штатов) – добавляем пустую строку
  if (!('state' in payloadCore)) {
    payloadCore.state = '';
  }

  const payload = {
    ssn: this.ssn,
    bday: this.bday,
    ...payloadCore
  };

  this.formDataService.createFormData(this.componentName, payload).subscribe({
    next: () => {
      this.toastr.success('Form submitted successfully.');
      this.isSurveySaved = true;
    },
    error: err => {
      console.error('[DformComponent] onSubmitSingleForm error:', err);
      this.toastr.error('Failed to submit form.');
    }
  });
}


  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach((control: AbstractControl) => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  ngOnDestroy(): void {
    this.editFormSubscription?.unsubscribe();
  }

  public getFormForIndex(i: number): FormGroup {
    if (this.form instanceof FormArray) {
      return this.form.at(i) as FormGroup;
    }
    return this.mainFormGroup;
  }

  public getActiveFormGroup(): FormGroup {
    if (this.form instanceof FormArray) {
      const idx = this.selectedIndex !== null ? this.selectedIndex : 0;
      return this.form.at(idx) as FormGroup;
    }
    return this.mainFormGroup;
  }
}
