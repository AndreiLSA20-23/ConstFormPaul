/*router.main.ts work project*/
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./base/start/start.component').then(m => m.StartComponent) }, // Главная страница
  { path: 'req', loadComponent: () => import('./base/req/req.component').then(m => m.ReqComponent) }, // Страница требований
  { path: 'auth', loadComponent: () => import('./user-auth/user-auth.component').then(m => m.UserAuthComponent) }, // Аутентификация
  { path: 'history-form', loadComponent: () => import('./history-form/history-form.component').then(m => m.HistoryFormComponent) }, // История
  { path: 'privacy-policy', loadComponent: () => import('./base/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent) }, // Политика конфиденциальности
  { path: '**', redirectTo: '' } // Перенаправление на главную
];
