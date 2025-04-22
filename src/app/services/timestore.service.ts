import { Injectable } from '@angular/core';
import { subMonths } from 'date-fns';
import { START_DATA_1 } from '../models/start-data'; // Импорт START_DATA_1

@Injectable({
  providedIn: 'root',
})
export class TimestoreService {
  storage: { startDate: Date; endDate: Date }[] = [];
  age: number = 36; // Максимальный возраст (в месяцах)
  empHistoryYears: number = START_DATA_1.empHistory; // Используем значение из START_DATA_1

  constructor() {}

  /**
   * Устанавливает максимальный возраст в месяцах.
   * @param age Максимальный возраст (в месяцах).
   */
  setAge(age: number): void {
    this.age = age;
  }

  /**
   * Устанавливает значение empHistory (в годах).
   * @param years Значение empHistory (в годах).
   */
  setEmpHistoryYears(years: number): void {
    this.empHistoryYears = years;
  }

  /**
   * Получает значение empHistory (в годах).
   * @returns Значение empHistory.
   */
  getEmpHistoryYears(): number {
    return this.empHistoryYears;
  }

  /**
   * Вычисляет промежутки времени (gaps) на основе заданных интервалов.
   * @param intervals Список интервалов с начальной и конечной датами.
   * @param maxMonths Максимальный интервал в месяцах для gap.
   * @returns Список промежутков времени.
   */
  calculateGaps(
    intervals: { startDate: Date; endDate: Date }[],
    maxMonths: number = this.empHistoryYears * 12
  ): { startDate: Date; endDate: Date }[] {
    const gaps: { startDate: Date; endDate: Date }[] = [];

    if (intervals.length === 0) {
      const overallStartDate = subMonths(new Date(), maxMonths);
      const overallEndDate = new Date();
      this.addUniqueGap(overallStartDate, overallEndDate, gaps);
      return gaps;
    }

    const mergedIntervals = this.mergeIntervals(intervals);

    const overallStartDate = subMonths(new Date(), maxMonths);
    const overallEndDate = new Date();

    // Проверяем зазор до первого интервала
    const firstStart = mergedIntervals[0].startDate;
    if (overallStartDate < firstStart) {
      this.addUniqueGap(overallStartDate, firstStart, gaps);
    }

    // Вычисляем зазоры между интервалами
    for (let i = 1; i < mergedIntervals.length; i++) {
      const prevEnd = mergedIntervals[i - 1].endDate;
      const currentStart = mergedIntervals[i].startDate;

      const adjustedPrevEnd = new Date(prevEnd);
      adjustedPrevEnd.setDate(adjustedPrevEnd.getDate() + 1);

      this.addUniqueGap(adjustedPrevEnd, currentStart, gaps);
    }

    // Проверяем зазор после последнего интервала
    const lastEnd = mergedIntervals[mergedIntervals.length - 1].endDate;
    const adjustedLastEnd = new Date(lastEnd);
    adjustedLastEnd.setDate(adjustedLastEnd.getDate() + 1);

    this.addUniqueGap(adjustedLastEnd, overallEndDate, gaps);

    return gaps;
  }

  /**
   * Добавляет уникальный зазор (gap) в список, если он не перекрывается с существующими.
   * @param startDate Начальная дата зазора.
   * @param endDate Конечная дата зазора.
   * @param gaps Список существующих зазоров.
   */
  private addUniqueGap(
    startDate: Date,
    endDate: Date,
    gaps: { startDate: Date; endDate: Date }[]
  ): void {
    if (startDate < endDate) {
      const isOverlap = gaps.some(
        (gap) => startDate < gap.endDate && endDate > gap.startDate
      );

      if (!isOverlap) {
        gaps.push({ startDate, endDate });
      }
    }
  }

  /**
   * Объединяет пересекающиеся интервалы в один.
   * @param intervals Список интервалов с начальной и конечной датами.
   * @returns Список объединённых интервалов.
   */
  private mergeIntervals(
    intervals: { startDate: Date; endDate: Date }[]
  ): { startDate: Date; endDate: Date }[] {
    if (intervals.length === 0) return [];

    const sortedIntervals = [...intervals].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );
    const merged: { startDate: Date; endDate: Date }[] = [];
    let currentInterval = sortedIntervals[0];

    for (let i = 1; i < sortedIntervals.length; i++) {
      const nextInterval = sortedIntervals[i];
      if (currentInterval.endDate >= nextInterval.startDate) {
        currentInterval = {
          startDate: currentInterval.startDate,
          endDate: new Date(
            Math.max(
              currentInterval.endDate.getTime(),
              nextInterval.endDate.getTime()
            )
          ),
        };
      } else {
        merged.push(currentInterval);
        currentInterval = nextInterval;
      }
    }

    merged.push(currentInterval);
    return merged;
  }

  /**
   * Проверяет, пересекается ли новый интервал с существующими.
   * @param newInterval Новый интервал для проверки.
   * @returns true, если интервал не пересекается с существующими, иначе false.
   */
  isAddressValid(newInterval: { startDate: Date; endDate: Date }): boolean {
    return !this.storage.some(
      (existingInterval) =>
        newInterval.startDate < existingInterval.endDate &&
        newInterval.endDate > existingInterval.startDate
    );
  }

  /**
   * Удаляет указанный интервал из хранилища.
   * @param startDate Начальная дата интервала.
   * @param endDate Конечная дата интервала.
   */
  removeInterval(startDate: Date, endDate: Date): void {
    this.storage = this.storage.filter(
      (interval) =>
        interval.startDate.getTime() !== startDate.getTime() ||
        interval.endDate.getTime() !== endDate.getTime()
    );
  }

  /**
   * Выводит текущее состояние хранилища в консоль.
   */
  logStorage(): void {
    console.log('Current storage:', this.storage);
  }
}
