import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpipSummary',
  standalone: true
})
export class CpipSummaryPipe implements PipeTransform {
  transform(formValue: any): string {
    //console.log('Пайп получает:', formValue);
    if (!formValue || typeof formValue !== 'object') {
      return '';
    }
    // Получаем все ключи в порядке вставки
    const keys = Object.keys(formValue);
    // Берем первые 6 ключей
    const firstSixKeys = keys.slice(0, 4);
    // Если количество ключей больше двух, переносим два последних в начало
    let reorderedKeys = firstSixKeys;
    if (firstSixKeys.length > 2) {
      const lastTwo = firstSixKeys.slice(-2);
      const remaining = firstSixKeys.slice(0, firstSixKeys.length - 2);
      reorderedKeys = [...lastTwo, ...remaining];
    }
    // Для каждого ключа формируем строку "ключ: значение"
    // Если значение пустое (null, undefined или пустая строка), выводим тире
    const summaryParts = reorderedKeys.map(key => {
      const value = (formValue[key] !== null && formValue[key] !== undefined && formValue[key] !== '')
        ? formValue[key]
        : '-';
      return `${key}: ${value}`;
    });
    return summaryParts.join(' || ');
  }
}
