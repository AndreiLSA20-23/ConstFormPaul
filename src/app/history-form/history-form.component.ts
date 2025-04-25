import {
  Component,
  Injector,
  OnInit,
  Inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import {
  NgComponentOutlet,
  NgIf,
  DatePipe,
  isPlatformBrowser,
  CommonModule,
} from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PerdatesComponent } from '../polls/perdates/perdates.component';
import { LicenseDetailsComponent } from '../polls/license-details/license-details.component';
import { DriverTrainingComponent } from '../polls/driver-training/driver-training.component';
import { ExpHistoryComponent } from '../polls/exp-history/exp-history.component';
import { AddAddressComponent } from '../polls/add-address/add-address.component';
import { FullResComponent } from '../polls/full-res/full-res.component';
import { ReportGeneratorComponent } from '../polls/report-generator/report-generator.component';

@Component({
  selector: 'app-history',
  standalone: true,
  templateUrl: './history-form.component.html',
  styleUrls: ['./history-form.component.scss'],
  imports: [
    NgIf,
    NgComponentOutlet,
    DatePipe,
    FormsModule,
    CommonModule,
    PerdatesComponent,
    LicenseDetailsComponent,
    DriverTrainingComponent,
    AddAddressComponent,
    ExpHistoryComponent,
    FullResComponent,
    ReportGeneratorComponent,
  ],
})
export class HistoryFormComponent implements OnInit, OnDestroy {
  /* ------------------------------------------------------------------ */
  /*  Поля состояния                                                    */
  /* ------------------------------------------------------------------ */
  private readonly apiUrl = 'http://64.251.23.111:8000/api/history';
  private readonly pollingDelay = 10_000;

  responseData: any = null;
  index = 1;
  currentComponent: any = null;

  customInjector!: Injector;

  prefillStatusMap = new Map<number, boolean>();
  prefillStatusReady = false;

  private pollingInterval: any = null;

  /* Порядок компонентов (index совпадает) */
  private readonly components = [
    null,
    PerdatesComponent,
    LicenseDetailsComponent,
    DriverTrainingComponent,
    AddAddressComponent,
    ExpHistoryComponent,
    FullResComponent,
    ReportGeneratorComponent,
  ];

  /* ------------------------------------------------------------------ */
  constructor(
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /* ------------------------------------------------------------------ */
  /*  ИНИЦИАЛИЗАЦИЯ                                                     */
  /* ------------------------------------------------------------------ */
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      /* SSR не трогаем */
      return;
    }

    const ssnFromLS = localStorage.getItem('currentUserSSN');
    const bdayFromLS = localStorage.getItem('currentUserBday');

    /*  1) Если данные уже есть → сразу строим инжектор */
    if (ssnFromLS && bdayFromLS) {
      this.buildInjector(ssnFromLS, bdayFromLS);
      this.afterInjectorReady(ssnFromLS, bdayFromLS);
    }

    /*  2) В любом случае запрашиваем историю — вдруг LS был пуст */
    this.fetchHistory().then((ok) => {
      if (!ok) console.warn('[History] History fetch returned empty payload');
    });
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  /* ------------------------------------------------------------------ */
  /*  Публичные геттеры                                                  */
  /* ------------------------------------------------------------------ */
  canShowPrev(): boolean {
    return this.index > 1;
  }

  get canProceed(): boolean {
    return this.prefillStatusMap.get(this.index) === true;
  }

  get completionProgress(): number {
    return Math.round((this.index / (this.components.length - 1)) * 100);
  }

  /* ------------------------------------------------------------------ */
  /*  Навигация                                                          */
  /* ------------------------------------------------------------------ */
  next(): void {
    if (this.canProceed) {
      this.index++;
      this.updateComponent();
    }
  }

  prev(): void {
    if (this.canShowPrev()) {
      this.index--;
      this.updateComponent();
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Основная логика                                                    */
  /* ------------------------------------------------------------------ */

  /** Загружает историю, возвращает true, если получили SSN/Bday */
  private async fetchHistory(): Promise<boolean> {
    const lsSSN = localStorage.getItem('currentUserSSN');
    if (!lsSSN) return false;

    try {
      const res = await fetch(`${this.apiUrl}/${lsSSN}`);
      if (!res.ok) return false;

      const data = await res.json();
      this.responseData = data;

      const realSSN = data?.data?.ssn;
      const realBday = data?.data?.bday;

      if (realSSN && realBday) {
        /* кладём в LS, чтобы другие вкладки тоже увидели  */
        localStorage.setItem('currentUserSSN', realSSN);
        localStorage.setItem('currentUserBday', realBday);

        /* если инжектор ещё не собран или был пустым → создаём заново */
        if (!this.customInjector) {
          this.buildInjector(realSSN, realBday);
          this.afterInjectorReady(realSSN, realBday);
        }
        return true;
      }
    } catch {
      /* silent */
    }
    return false;
  }

  /** Создаёт DI-контейнер с токенами ssn/bday */
  private buildInjector(ssn: string, bday: string): void {
    this.customInjector = Injector.create({
      providers: [
        { provide: 'ssn', useValue: ssn },
        { provide: 'bday', useValue: bday },
      ],
      parent: this.injector,
    });
  }

  /** Всё, что должно выполняться, когда токены гарантированы */
  private afterInjectorReady(ssn: string, bday: string): void {
    /*  рендерим */
    this.updateComponent();

    /*  запускаем проверки */
    this.checkAllPrefillBlocks(ssn, bday);
    this.startPollingPrefillStatus(ssn, bday);
  }

  /** Перерисовывает текущий подкомпонент */
  private updateComponent(): void {
    this.currentComponent = this.components[this.index] ?? null;
  }

  /* ------------------------------------------------------------------ */
  /*  Проверка заполненности блоков                                     */
  /* ------------------------------------------------------------------ */
  private async checkAllPrefillBlocks(
    ssn: string,
    bday: string
  ): Promise<void> {
    this.prefillStatusReady = false;

    const results: [number, boolean][] = [];

    for (let idx = 1; idx < this.components.length; idx++) {
      const key = this.getComponentKeyByIndex(idx);
      const url = `http://64.251.23.111:8000/api/form-data/${key}/${ssn}`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          results.push([idx, false]);
          continue;
        }
        const json = await res.json();
        results.push([idx, this.isComponentFilled(json?.data)]);
      } catch {
        results.push([idx, false]);
      }
    }

    /* Сохраняем карту и перерисовываем, если текущий шаг стал доступен */
    for (const [idx, filled] of results) {
      this.prefillStatusMap.set(idx, filled);
      if (idx === this.index && filled) this.updateComponent();
    }

    this.prefillStatusReady = true;
  }

  private isComponentFilled(data: any): boolean {
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (data.items && Array.isArray(data.items)) return data.items.length > 0;
    if (typeof data === 'object') {
      return Object.values(data).some((v) => {
        if (typeof v === 'object') return this.isComponentFilled(v);
        if (typeof v === 'boolean') return true;
        return v !== '' && v !== null && v !== undefined;
      });
    }
    return false;
  }

  private startPollingPrefillStatus(ssn: string, bday: string): void {
    this.pollingInterval = setInterval(
      () => this.checkAllPrefillBlocks(ssn, bday),
      this.pollingDelay
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Утилиты                                                            */
  /* ------------------------------------------------------------------ */
  private getComponentKeyByIndex(index: number): string {
    switch (index) {
      case 1:
        return 'app-perdates';
      case 2:
        return 'app-license-details';
      case 3:
        return 'app-driver-training';
      case 4:
        return 'add-address';
      case 5:
        return 'experience-history';
      case 6:
        return 'app-full-res';
      case 7:
        return 'app-report-generator';
      default:
        return '';
    }
  }
}