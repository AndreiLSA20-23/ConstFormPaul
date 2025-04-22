import {
  Component,
  Injector,
  OnInit,
  Inject,
  PLATFORM_ID,
  OnDestroy
} from '@angular/core';
import {
  NgComponentOutlet,
  NgIf,
  DatePipe,
  isPlatformBrowser,
  CommonModule
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
  imports: [
    NgIf,
    NgComponentOutlet,
    DatePipe,
    FormsModule,
    CommonModule,
    PerdatesComponent,
    LicenseDetailsComponent,
    DriverTrainingComponent,
    ExpHistoryComponent,
    AddAddressComponent,
    FullResComponent,
    ReportGeneratorComponent
  ],
  styleUrls: ['./history-form.component.scss']
})
export class HistoryFormComponent implements OnInit, OnDestroy {
  apiUrl = 'http://localhost:8000/api/history';
  responseData: any = null;
  public index: number = 1;
  public currentComponent: any = null;
  public customInjector!: Injector;
  public prefillStatusMap: Map<number, boolean> = new Map();
  public prefillStatusReady: boolean = false;

  private readonly components = [
    null,
    PerdatesComponent,
    LicenseDetailsComponent,
    DriverTrainingComponent,
    AddAddressComponent,
    ExpHistoryComponent,
    FullResComponent,
    ReportGeneratorComponent
  ];

  private pollingInterval: any = null;
  private readonly pollingDelay = 10000;

  constructor(
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentUserSSN = localStorage.getItem('currentUserSSN');
      const currentUserBday = localStorage.getItem('currentUserBday');

      this.customInjector = Injector.create({
        providers: [
          { provide: 'ssn', useValue: currentUserSSN },
          { provide: 'bday', useValue: currentUserBday }
        ],
        parent: this.injector
      });

      this.fetchHistory(currentUserSSN);
      this.checkAllPrefillBlocks(currentUserSSN, currentUserBday);
      this.startPollingPrefillStatus(currentUserSSN, currentUserBday);
    }

    this.updateComponent();
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  fetchHistory(currentUserSSN: string | null): void {
    if (!currentUserSSN) return;

    fetch(`${this.apiUrl}/${currentUserSSN}`)
      .then((res) => res.json())
      .then((data) => (this.responseData = data))
      .catch(() => (this.responseData = null));
  }

  async checkAllPrefillBlocks(ssn: string | null, bday: string | null): Promise<void> {
    this.prefillStatusReady = false;
    if (!ssn || !bday) return;

    const results: [number, boolean][] = [];

    for (let index = 1; index < this.components.length; index++) {
      const componentKey = this.getComponentKeyByIndex(index);
      const url = `http://localhost:8000/api/form-data/${componentKey}/${ssn}`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          results.push([index, false]);
          continue;
        }
        const json = await res.json();
        const data = json?.data;
        let isFilled = this.isComponentFilled(data);

        results.push([index, isFilled]);
      } catch (err) {
        results.push([index, false]);
      }
    }

    for (const [index, filled] of results) {
      this.prefillStatusMap.set(index, filled);
      if (index === this.index && filled) this.updateComponent();
    }

    this.prefillStatusReady = true;
  }

  private isComponentFilled(data: any): boolean {
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (data.items && Array.isArray(data.items)) return data.items.length > 0;
    if (typeof data === 'object') {
      return Object.entries(data).some(([_, val]) => {
        if (typeof val === 'object') return this.isComponentFilled(val);
        if (typeof val === 'boolean') return true;
        return val !== '' && val !== null && val !== undefined;
      });
    }
    return false;
  }

  private startPollingPrefillStatus(ssn: string | null, bday: string | null): void {
    if (!ssn || !bday) return;

    this.pollingInterval = setInterval(() => {
      this.checkAllPrefillBlocks(ssn, bday);
    }, this.pollingDelay);
  }

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

  updateComponent(): void {
    this.currentComponent = this.components[this.index] || null;
  }

  canShowPrev(): boolean {
    return this.index > 1;
  }

  get canProceed(): boolean {
    return this.prefillStatusMap.get(this.index) === true;
  }

  get completionProgress(): number {
    return Math.round((this.index / (this.components.length - 1)) * 100);
  }

  private getComponentKeyByIndex(index: number): string {
    switch (index) {
      case 1: return 'app-perdates';
      case 2: return 'app-license-details';
      case 3: return 'app-driver-training';
      case 4: return 'add-address';
      case 5: return 'experience-history';
      case 6: return 'app-full-res';
      case 7: return 'app-report-generator';
      default: return '';
    }
  }
}