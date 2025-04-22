import {
  CommonModule,
  DatePipe,
  NgForOf,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  TitleCasePipe
} from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { TimestoreService } from '../../services/timestore.service';
import { AddAddressService } from '../../services/add-address-service.service';
import { EmploymentFormComponent } from '../../exp-histories/employment-form/employment-form.component';
import { UnemploymentFormComponent } from '../../exp-histories/unemployment-form/unemployment-form.component';
import { SchoolFormComponent } from '../../exp-histories/school-form/school-form.component';
import { MilitaryServiceFormComponent } from '../../exp-histories/military-service-form/military-service-form.component';
import { START_DATA_1 } from '../../models/start-data';

@Component({
  selector: 'app-exp-history',
  standalone: true,
  templateUrl: './exp-history.component.html',
  styleUrls: ['./exp-history.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    TitleCasePipe,
    NgIf,
    NgForOf,
    NgSwitch,
    NgSwitchCase,
    EmploymentFormComponent,
    UnemploymentFormComponent,
    SchoolFormComponent,
    MilitaryServiceFormComponent,
  ],
})
export class ExpHistoryComponent implements OnInit {
  @ViewChild(EmploymentFormComponent) employmentFormComponent!: EmploymentFormComponent;
  @ViewChild(UnemploymentFormComponent) unemploymentFormComponent!: UnemploymentFormComponent;
  @ViewChild(SchoolFormComponent) schoolFormComponent!: SchoolFormComponent;
  @ViewChild(MilitaryServiceFormComponent) militaryFormComponent!: MilitaryServiceFormComponent;

  selectedHistoryType: string = '';
  editingIndex: number | null = null;

  countries: string[] = [];
  states: string[] = [];
  processedHistories: any[] = [];
  gaps: { startDate: Date; endDate: Date }[] = [];
  gapData: { startDate: Date; endDate: Date } | null = null;
  gapYears: number = START_DATA_1.empHistory;

  isModalOpen = false;
  isDirty = false;

  private ssn = localStorage.getItem('currentUserSSN') ?? '';
  private bday = localStorage.getItem('currentUserBday') ?? '';

  constructor(
    private addAddressService: AddAddressService,
    private timestoreService: TimestoreService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initializeCountries();
    this.setDateIntervals();
    this.loadPrefill();
  }

  private initializeCountries(): void {
    this.countries = this.addAddressService.getCountries();
  }

  /** Загрузка сохранённых данных */
  private loadPrefill(): void {
    if (!this.ssn) {
      console.warn('[ExpHistory] SSN not provided');
      this.calculateGaps();
      return;
    }
    const url = `http://localhost:8000/api/form-data/experience-history/${this.ssn}`;
    this.http.get<{ data: any[] }>(url).subscribe({
      next: resp => {
        this.processedHistories = Array.isArray(resp.data) ? resp.data : [];
        if (!Array.isArray(resp.data)) {
          console.warn('[ExpHistory] prefill data is not array');
        }
        this.sortHistories();
        this.calculateGaps();
        this.isDirty = true;
      },
      error: err => {
        console.error('[ExpHistory] prefill error', err);
        this.processedHistories = [];
        this.calculateGaps();
      }
    });
  }

  onCountryChangeForm(event: any): void {
    this.states = this.addAddressService.getStatesForCountry(event);
  }

  onHistoryTypeChange(): void {
    this.editingIndex = null;
    this.gapData = null;
  }

  openModal(index?: number): void {
    if (index != null) {
      const history = this.processedHistories[index];
      this.selectedHistoryType = history.type;
      this.editingIndex = index;
      // prefill form component
      switch (history.type) {
        case 'employment':
          this.employmentFormComponent.employmentForm.patchValue(history);
          break;
        case 'unemployment':
          this.unemploymentFormComponent.unemploymentForm.patchValue(history);
          break;
        case 'school':
          this.schoolFormComponent.schoolForm.patchValue(history);
          break;
        case 'militaryService':
          this.militaryFormComponent.militaryServiceForm.patchValue(history);
          break;
      }
    } else {
      this.editingIndex = null;
      this.gapData = null;
    }
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingIndex = null;
    this.gapData = null;
  }

  private isOverlapping(newStartDate: Date, newEndDate: Date): boolean {
    return this.processedHistories.some((history, idx) => {
      if (idx === this.editingIndex || history.type !== this.selectedHistoryType) return false;
      const existingStart = new Date(history.startDate);
      const existingEnd = new Date(history.endDate);
      return newStartDate <= existingEnd && newEndDate >= existingStart;
    });
  }

  saveHistory(event: any): void {
    const newStartDate = new Date(event.startDate);
    const newEndDate = new Date(event.endDate);
    if (this.isOverlapping(newStartDate, newEndDate)) {
      alert('Intervals cannot overlap.');
      return;
    }

    const newEntry = {
      ...event,
      startDate: newStartDate.toISOString().split('T')[0],
      endDate: newEndDate.toISOString().split('T')[0],
      type: this.selectedHistoryType,
      country: event.country || event.countrySchool || event.countryMilit || '',
      state: event.state || event.stateSchool || event.stateMilit || '',
      // … остальные поля
    };

    if (this.editingIndex !== null) {
      this.processedHistories[this.editingIndex] = newEntry;
    } else {
      this.processedHistories.push(newEntry);
    }

    this.isDirty = true;
    this.sortHistories();
    this.calculateGaps();
    this.closeModal();
  }

  editHistory(index: number): void {
    this.openModal(index);
  }

  removeHistory(index: number): void {
    this.processedHistories.splice(index, 1);
    this.isDirty = true;
    this.sortHistories();
    this.calculateGaps();
  }

  sortHistories(): void {
    this.processedHistories.sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }

  setDateIntervals(): void {
    const now = new Date();
    const min = new Date();
    min.setFullYear(now.getFullYear() - this.gapYears);
    this.gaps = [{ startDate: min, endDate: now }];
  }

  calculateGaps(): void {
    const intervals = this.processedHistories.map(entry => ({
      startDate: new Date(entry.startDate),
      endDate: new Date(entry.endDate)
    }));
    this.gaps = this.timestoreService.calculateGaps(intervals, this.gapYears * 12);
  }

  fillGapWithHistory(gap: { startDate: Date; endDate: Date }): void {
    if (!gap || !this.selectedHistoryType) return;
    const start = gap.startDate.toISOString().split('T')[0];
    const end = gap.endDate.toISOString().split('T')[0];
    switch (this.selectedHistoryType) {
      case 'employment':
        this.employmentFormComponent.employmentForm.patchValue({ startDate: start, endDate: end });
        break;
      case 'unemployment':
        this.unemploymentFormComponent.unemploymentForm.patchValue({ startDate: start, endDate: end });
        break;
      case 'school':
        this.schoolFormComponent.schoolForm.patchValue({ startDate: start, endDate: end });
        break;
      case 'militaryService':
        this.militaryFormComponent.militaryServiceForm.patchValue({ startDate: start, endDate: end });
        break;
    }
  }

  /** Отправка на сервер */
  saveAllChanges(): void {
    if (this.gaps.length > 0 || !this.isDirty) {
      console.warn('[ExpHistory] cannot save, gaps exist or no changes');
      return;
    }
    const payload = {
      ssn: this.ssn,
      bday: this.bday,
      additional_data: { 'experience-history': this.processedHistories }
    };
    this.http.post(
      'http://localhost:8000/api/create-or-update-json',
      payload
    ).subscribe({
      next: () => {
        console.log('[ExpHistory] saved');
        this.isDirty = false;
      },
      error: err => console.error('[ExpHistory] save error', err)
    });
  }
}
