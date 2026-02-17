import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, I18nService, ToastService } from '../../core/services';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>{{ i18n.t('login.title') }}</h1>
          <p>{{ i18n.t('login.subtitle') }}</p>
        </div>

        @if (error()) {
          <div class="alert alert-error">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">{{ i18n.t('login.email') }}</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              [placeholder]="i18n.t('register.emailPlaceholder')"
              class="form-control"
              [class.error]="emailError()"
              (input)="validateEmail()"
              (blur)="validateEmail()"
            />
            @if (emailError()) {
              <span class="error-message">{{ emailError() }}</span>
            }
          </div>

          <div class="form-group">
            <label for="password">{{ i18n.t('login.password') }}</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                required
                [placeholder]="i18n.t('login.password')"
                class="form-control"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="toggle-password"
              >
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="btn btn-primary btn-block"
          >
            {{ loading() ? i18n.t('login.loading') : i18n.t('login.submit') }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
      padding: 2rem;
    }

    .login-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      padding: 2rem;
      width: 100%;
      max-width: 420px;
      box-shadow: var(--shadow-xl);
      position: relative;
      overflow: hidden;
    }

    .login-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: var(--gradient-primary);
      background-size: 200% 200%;
      animation: gradient-shift 3s ease infinite;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      background: var(--gradient-primary);
      background-size: 200% 200%;
      animation: gradient-shift 4s ease infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 1.875rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .login-header p {
      color: var(--text-secondary);
      margin: 0;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      margin-bottom: 1.5rem;
    }

    .alert-error {
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.875rem;
    }

    .password-input-wrapper {
      position: relative;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 1rem;
      transition: all 0.2s;
      width: 100%;
    }

    .password-input-wrapper .form-control {
      padding-right: 2.5rem;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-bg);
    }

    .toggle-password {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0.25rem;
      transition: opacity 0.2s;
    }

    .toggle-password:hover {
      opacity: 0.7;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      font-size: 1rem;
    }

    .btn-primary {
      background: var(--gradient-primary);
      background-size: 200% 200%;
      color: white;
      box-shadow: var(--shadow-md);
    }

    .btn-primary:hover:not(:disabled) {
      animation: gradient-shift 2s ease infinite;
      transform: translateY(-2px);
      box-shadow: var(--shadow-colored);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-block {
      width: 100%;
    }

    .form-control.error {
      border-color: #f5576c;
    }

    .form-control.error:focus {
      box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
    }

    .error-message {
      color: #f5576c;
      font-size: 0.75rem;
      font-weight: 500;
      margin-top: 0.25rem;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  i18n = inject(I18nService);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);
  emailError = signal('');

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  validateEmail(): void {
    if (!this.email) {
      this.emailError.set('');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.emailError.set(this.i18n.currentLanguage() === 'pl' ? 'Nieprawidłowy format email' : 'Invalid email format');
    } else {
      this.emailError.set('');
    }
  }

  onSubmit(): void {
    this.validateEmail();

    if (!this.email || !this.password) {
      this.error.set(this.i18n.currentLanguage() === 'pl' ? 'Wprowadź email i hasło' : 'Please enter email and password');
      return;
    }

    if (this.emailError()) {
      this.error.set(this.i18n.currentLanguage() === 'pl' ? 'Popraw błędy w formularzu' : 'Fix errors in the form');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('toast.loginSuccess'));
        this.router.navigate(['/sections']);
      },
      error: (err) => {
        this.error.set(err.message || this.i18n.t('toast.loginError'));
        this.toast.error(this.i18n.t('toast.loginError'));
        this.loading.set(false);
      }
    });
  }
}
