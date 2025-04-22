import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appSsnMask]' // Применяем директиву к полям с этим атрибутом
})
export class SsnMaskDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    let value = this.el.nativeElement.value;

    // Удаляем все символы, кроме цифр
    value = value.replace(/\D/g, '');

    // Обрезаем строку до максимальной длины (9 цифр)
    if (value.length > 9) {
      value = value.slice(0, 9);
    }

    // Форматируем строку в формате xxx-xx-xxxx
    if (value.length > 5) {
      value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    }

    // Устанавливаем отформатированное значение в поле ввода
    this.el.nativeElement.value = value;
  }

  @HostListener('blur', ['$event'])
  onBlur(event: any): void {
    const value = this.el.nativeElement.value;

    // Проверяем, соответствует ли значение формату xxx-xx-xxxx
    const isValid = /^\d{3}-\d{2}-\d{4}$/.test(value);

    if (!isValid && value !== '') {
      this.el.nativeElement.setCustomValidity('Invalid SSN format. Use xxx-xx-xxxx.');
    } else {
      this.el.nativeElement.setCustomValidity('');
    }
  }
}
