import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WrapperApiService {
  private readonly baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  /**
   * Загружает префилл для указанной компоненты и SSN.
   * Возвращает Observable с данными (по умолчанию пустой массив или объект).
   */
  loadPrefill<T>(componentName: string, ssn: string): Observable<T> {
    const url = `${this.baseUrl}/form-data/${componentName}/${ssn}`;
    return this.http.get<{ data: T }>(url).pipe(
      map((resp) => resp?.data ?? ([] as any as T)),
      catchError((err) => {
        console.warn(`[WrapperApiService] loadPrefill error:`, err);
        return of(([] as any) as T);
      })
    );
  }

  /**
   * Сохраняет данные компоненты (в additional_data под ключом componentName).
   */
  persistData<T extends Record<string, any>>(ssn: string, bday: string, componentName: string, data: T): Observable<boolean> {
    const payload = {
      ssn,
      bday,
      additional_data: {
        [componentName]: data
      }
    };
    return this.http.post(`${this.baseUrl}/create-or-update-json`, payload).pipe(
      map(() => true),
      catchError((err) => {
        console.error(`[WrapperApiService] persistData error:`, err);
        return of(false);
      })
    );
  }
}
