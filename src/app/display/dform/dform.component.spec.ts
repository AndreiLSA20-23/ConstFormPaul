import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormArray, FormGroup, FormControl } from '@angular/forms';
import { DformComponent } from './dform.component';
import { DinFormJsonWorkerService } from '../../services/din-form-json-worker.service';
import { FormDataService } from '../../services/formdata.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ToastrModule } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DformComponent', () => {
  let component: DformComponent;
  let fixture: ComponentFixture<DformComponent>;
  let formDataServiceSpy: jasmine.SpyObj<FormDataService>;
  let dinFormServiceSpy: jasmine.SpyObj<DinFormJsonWorkerService>;

  beforeEach(async () => {
    const formDataSpy = jasmine.createSpyObj('FormDataService', ['createFormData']);
    formDataSpy.createFormData.and.returnValue(of({}));

    const dinFormSpy = jasmine.createSpyObj('DinFormJsonWorkerService', [
      'generateSingleFormGroup',
      'loadRequirements'
    ]);
    // Фиктивная реализация generateSingleFormGroup возвращает простую FormGroup
    dinFormSpy.generateSingleFormGroup.and.callFake((struct: any, options: any = {}) => {
      return new FormGroup({
        startDate: new FormControl(''),
        schoolName: new FormControl('')
      });
    });
    // Фиктивная реализация loadRequirements, чтобы избежать ошибки при вызове в BaseComponent
    dinFormSpy.loadRequirements.and.returnValue(of({ variables: {}, components: {} }));

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        NoopAnimationsModule, // Добавляем NoopAnimationsModule для анимаций
        ToastrModule.forRoot(),  // Чтобы обеспечить провайдер ToastConfig
        // Импортируем standalone-компонент через imports
        DformComponent
      ],
      providers: [
        { provide: FormDataService, useValue: formDataSpy },
        { provide: DinFormJsonWorkerService, useValue: dinFormSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'ssn') return '111-11-1111';
                  if (key === 'bday') return '1981-01-01';
                  return null;
                }
              }
            },
            data: of({ ssn: '111-11-1111', bday: '1981-01-01' })
          }
        }
      ]
    }).compileComponents();

    // Спай для window.confirm, чтобы не перезагружать страницу при вызове
    spyOn(window, 'confirm').and.returnValue(true);

    fixture = TestBed.createComponent(DformComponent);
    component = fixture.componentInstance;
    component.componentName = 'app-driver-training';

    // Имитация processedData – минимальная структура для тестов
    component.processedData = {
      id: 'test',
      type: 'form',
      elements: []
    };

    // Инициализируем форму как FormArray с одним заполненным элементом
    component.form = new FormArray([
      new FormGroup({
        startDate: new FormControl('2020-01-01'),
        schoolName: new FormControl('Initial School')
      })
    ]);

    // Разрешаем добавление новых элементов
    component.isSurveySaved = true;

    formDataServiceSpy = TestBed.inject(FormDataService) as jasmine.SpyObj<FormDataService>;
    dinFormServiceSpy = TestBed.inject(DinFormJsonWorkerService) as jasmine.SpyObj<DinFormJsonWorkerService>;

    fixture.detectChanges();
  });

  it('should add a new empty survey to FormArray when onAddNewItem is called', () => {
    const formArray = component.form as FormArray;
    const initialLength = formArray.length;
    component.onAddNewItem();
    fixture.detectChanges();

    expect(formArray.length).toBe(initialLength + 1);
    const newGroup = formArray.at(formArray.length - 1) as FormGroup;
    expect(newGroup.value.startDate).toBe('');
    expect(newGroup.value.schoolName).toBe('');
  });

  it('should update survey data in FormArray on edit', () => {
    const formArray = component.form as FormArray;

    // Добавляем новый элемент для редактирования
    component.onAddNewItem();
    fixture.detectChanges();

    // Выбираем второй элемент (индекс 1)
    component.selectedIndex = 1;
    component.onEditItem(1);
    fixture.detectChanges();

    // Программно заполняем данные редактируемой формы
    component.editForm.patchValue({
      startDate: '2010-01-01',
      schoolName: 'Test School'
    });
    fixture.detectChanges();

    const updatedGroup = formArray.at(1) as FormGroup;
    expect(updatedGroup.value.startDate).toBe('2010-01-01');
    expect(updatedGroup.value.schoolName).toBe('Test School');
  });

  it('should create 5 filled surveys and form correct payload', () => {
    const formArray = component.form as FormArray;
    // Добавляем ещё 4 элемента, чтобы получить 5 опросов
    for (let i = 0; i < 4; i++) {
      component.isSurveySaved = true;
      component.onAddNewItem();
      fixture.detectChanges();
    }
    expect(formArray.length).toBe(5);

    // Программно заполняем каждый элемент уникальными данными
    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.at(i) as FormGroup;
      group.patchValue({
        startDate: `2010-0${i + 1}-01`,
        schoolName: `Test School ${i + 1}`
      });
    }
    fixture.detectChanges();

    const expectedItems = formArray.value;
    const expectedPayload = {
      ssn: component.ssn,
      bday: component.bday,
      items: expectedItems
    };

    // Вызываем onSubmitFormArray для формирования payload
    component.onSubmitFormArray();
    fixture.detectChanges();

    expect(formDataServiceSpy.createFormData).toHaveBeenCalled();
    const actualPayload = formDataServiceSpy.createFormData.calls.mostRecent().args[1];
    expect(JSON.stringify(actualPayload)).toEqual(JSON.stringify(expectedPayload));
  });
});
