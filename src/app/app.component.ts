import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StartComponent } from './base/start/start.component';
import { ReqComponent } from './base/req/req.component';
import { UserAuthComponent } from './user-auth/user-auth.component';
import { PrivacyPolicyComponent } from './base/privacy-policy/privacy-policy.component';
import { HistoryFormComponent } from './history-form/history-form.component';
import { NgIf } from '@angular/common';
import { SsnMaskDirective } from './dirs/ssn-mask.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule, // Для маршрутизации
    StartComponent,
    ReqComponent,
    UserAuthComponent,
    HistoryFormComponent,
    PrivacyPolicyComponent,
    NgIf,
    SsnMaskDirective,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public index = 1; // Текущий индекс
  public currentComponent: any = null; // Текущий отображаемый компонент (на основе массива components)
  public isPrivacyPolicyVisible = false; // Флаг отображения политики конфиденциальности

  // Массив компонентов для навигации (0-й индекс – заглушка)
  private readonly components = [
    null,
    StartComponent,
    ReqComponent,
    UserAuthComponent,
  ];

  // Маршруты для навигации
  private readonly routes = [
    '/',            // Главная страница
    '/req',         // Страница требований
    '/auth',        // Аутентификация
    '/history-form',// История
  ];

  constructor(private router: Router) {
    this.updateComponent();
  }

  /**
   * Переход на следующий компонент
   */
  public next(): void {
    if (this.canShowNext()) {
      this.index++;
      this.updateComponent();
      this.router.navigate([this.routes[this.index - 1]]);
    }
  }

  /**
   * Переход на предыдущий компонент
   */
  public red(): void {
    if (this.canShowPreview()) {
      this.index--;
      this.updateComponent();
      this.router.navigate([this.routes[this.index - 1]]);
    }
  }

  /**
   * Обновление текущего компонента
   */
  private updateComponent(): void {
    this.currentComponent = this.components[this.index] || null;
  }

  /**
   * Проверка, можно ли отобразить кнопку "Previous"
   * Кнопка скрывается, если:
   * - Текущий индекс меньше или равен 1, или
   * - Текущий компонент – UserAuthComponent
   */
  public canShowPreview(): boolean {
    if (this.components[this.index] === UserAuthComponent) {
      return false;
    }
    return this.index > 1;
  }

  /**
   * Проверка, можно ли отобразить кнопку "Next"
   * Кнопка скрывается, если:
   * - Текущий маршрут – "/history-form"
   * - Или если текущий маршрут – "/auth"
   * - Или если достигнут конец массива компонентов
   */
  public canShowNext(): boolean {
    if (this.router.url === '/history-form' || this.router.url === '/auth') {
      return false;
    }
    return this.index < this.components.length - 1;
  }

  /**
   * Показ политики конфиденциальности
   */
  public showPrivacyPolicy(): void {
    this.isPrivacyPolicyVisible = true;
  }

  /**
   * Скрытие политики конфиденциальности
   */
  public hidePrivacyPolicy(): void {
    this.isPrivacyPolicyVisible = false;
  }
}
