import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, I18nService, ToastService } from '../../core/services';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>{{ i18n.t('register.title') }}</h1>
          <p>{{ i18n.t('register.subtitle') }}</p>
        </div>

        @if (error()) {
          <div class="alert alert-error">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-group">
            <label for="username">{{ i18n.t('register.username') }}</label>
            <input
              id="username"
              type="text"
              [(ngModel)]="username"
              name="username"
              required
              placeholder="{{ i18n.t('register.usernamePlaceholder') }}"
              class="form-control"
              [class.error]="usernameError()"
            />
            @if (usernameError()) {
              <span class="error-message">{{ usernameError() }}</span>
            }
          </div>

          <div class="form-group">
            <label for="email">{{ i18n.t('register.email') }}</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="{{ i18n.t('register.emailPlaceholder') }}"
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
            <label for="phone">{{ i18n.currentLanguage() === 'pl' ? 'Telefon' : 'Phone' }}</label>
            <div style="display: flex; gap: 0.5rem;">
              <select
                [(ngModel)]="countryCode"
                name="countryCode"
                class="form-control"
                style="flex: 0 0 100px;"
              >
                <option value="+48">🇵🇱 +48</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+33">🇫🇷 +33</option>
              </select>
              <input
                id="phone"
                type="tel"
                [(ngModel)]="phone"
                name="phone"
                required
                placeholder="123456789"
                class="form-control"
                [class.error]="phoneError()"
                style="flex: 1;"
              />
            </div>
            @if (phoneError()) {
              <span class="error-message">{{ phoneError() }}</span>
            }
          </div>

          <div class="form-group">
            <label for="password">{{ i18n.t('register.password') }}</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                required
                placeholder="{{ i18n.t('register.passwordPlaceholder') }}"
                class="form-control"
                [class.error]="passwordError()"
                (input)="validatePassword()"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="toggle-password"
              >
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
            @if (passwordError()) {
              <span class="error-message">{{ passwordError() }}</span>
            }
            @if (password && !passwordError()) {
              <div class="password-strength">
                <div class="strength-bar" [class]="passwordStrength()">
                  <div class="strength-fill"></div>
                </div>
                <span class="strength-text">{{ getPasswordStrengthText() }}</span>
              </div>
            }
          </div>

          <div class="form-group">
            <label for="confirmPassword">{{ i18n.t('register.confirmPassword') }}</label>
            <div class="password-input-wrapper">
              <input
                id="confirmPassword"
                [type]="showConfirmPassword() ? 'text' : 'password'"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                placeholder="{{ i18n.t('register.confirmPasswordPlaceholder') }}"
                class="form-control"
                [class.error]="confirmPasswordError()"
                (input)="validateConfirmPassword()"
              />
              <button
                type="button"
                (click)="toggleConfirmPasswordVisibility()"
                class="toggle-password"
              >
                {{ showConfirmPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
            @if (confirmPasswordError()) {
              <span class="error-message">{{ confirmPasswordError() }}</span>
            } @else if (confirmPassword && password === confirmPassword) {
              <span class="success-message">✓ {{ i18n.t('register.passwordsMatch') }}</span>
            }
          </div>

          <button
            type="submit"
            [disabled]="loading() || !isFormValid()"
            class="btn btn-primary btn-block"
          >
            {{ loading() ? i18n.t('register.registering') : i18n.t('register.submit') }}
          </button>
        </form>

        <div class="login-link">
          <p>{{ i18n.t('register.haveAccount') }}
            <a routerLink="/login" class="link">{{ i18n.t('register.loginHere') }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
      padding: 2rem 1rem;
    }

    .register-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      padding: 2rem;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .register-header h1 {
      color: var(--text-primary);
      font-size: 1.875rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .register-header p {
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

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
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

    .form-control.error {
      border-color: #f5576c;
    }

    .form-control.error:focus {
      box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
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

    .error-message {
      color: #f5576c;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .success-message {
      color: #43e97b;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .password-strength {
      margin-top: 0.5rem;
    }

    .strength-bar {
      height: 0.25rem;
      background: var(--bg-tertiary);
      border-radius: 0.125rem;
      overflow: hidden;
      margin-bottom: 0.25rem;
    }

    .strength-fill {
      height: 100%;
      transition: all 0.3s;
      width: 0;
    }

    .strength-bar.weak .strength-fill {
      width: 33%;
      background: #f5576c;
    }

    .strength-bar.medium .strength-fill {
      width: 66%;
      background: #f5a623;
    }

    .strength-bar.strong .strength-fill {
      width: 100%;
      background: #43e97b;
    }

    .strength-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 500;
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
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-hover);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-block {
      width: 100%;
    }

    .login-link {
      margin-top: 1.5rem;
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .login-link p {
      color: var(--text-secondary);
      margin: 0;
      font-size: 0.875rem;
    }

    .link {
      color: var(--primary-color);
      font-weight: 600;
      text-decoration: none;
      transition: opacity 0.2s;
    }

    .link:hover {
      opacity: 0.8;
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  i18n = inject(I18nService);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  countryCode = '+48';
  phone = '';
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  usernameError = signal('');
  emailError = signal('');
  passwordError = signal('');
  confirmPasswordError = signal('');
  phoneError = signal('');
  passwordStrength = signal('');

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  validatePassword(): void {
    if (!this.password) {
      this.passwordError.set('');
      this.passwordStrength.set('');
      return;
    }

    if (this.password.length < 6) {
      this.passwordError.set(this.i18n.currentLanguage() === 'pl' ? 'Hasło musi mieć minimum 6 znaków' : 'Password must be at least 6 characters');
      this.passwordStrength.set('');
      return;
    }

    this.passwordError.set('');

    // Calculate password strength
    let strength = 0;
    if (this.password.length >= 8) strength++;
    if (/[a-z]/.test(this.password) && /[A-Z]/.test(this.password)) strength++;
    if (/\d/.test(this.password)) strength++;
    if (/[^a-zA-Z\d]/.test(this.password)) strength++;

    if (strength <= 1) {
      this.passwordStrength.set('weak');
    } else if (strength <= 2) {
      this.passwordStrength.set('medium');
    } else {
      this.passwordStrength.set('strong');
    }

    this.validateConfirmPassword();
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

  validateConfirmPassword(): void {
    if (!this.confirmPassword) {
      this.confirmPasswordError.set('');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError.set(this.i18n.currentLanguage() === 'pl' ? 'Hasła nie są identyczne' : 'Passwords do not match');
    } else {
      this.confirmPasswordError.set('');
    }
  }

  getPasswordStrengthText(): string {
    const lang = this.i18n.currentLanguage();
    const strength = this.passwordStrength();
    if (strength === 'weak') return lang === 'pl' ? 'Słabe hasło' : 'Weak password';
    if (strength === 'medium') return lang === 'pl' ? 'Średnie hasło' : 'Medium password';
    if (strength === 'strong') return lang === 'pl' ? 'Silne hasło' : 'Strong password';
    return '';
  }

  isFormValid(): boolean {
    return !!(
      this.username &&
      this.email &&
      this.password &&
      this.confirmPassword &&
      !this.usernameError() &&
      !this.emailError() &&
      !this.passwordError() &&
      !this.confirmPasswordError() &&
      this.password === this.confirmPassword &&
      this.password.length >= 6
    );
  }

  onSubmit(): void {
    // Validate all fields
    if (!this.username) {
      this.usernameError.set(this.i18n.currentLanguage() === 'pl' ? 'Nazwa użytkownika jest wymagana' : 'Username is required');
      return;
    }

    if (!this.email) {
      this.emailError.set(this.i18n.currentLanguage() === 'pl' ? 'Email jest wymagany' : 'Email is required');
      return;
    }

    this.validateEmail();
    this.validatePassword();
    this.validateConfirmPassword();

    if (!this.isFormValid()) {
      this.error.set(this.i18n.currentLanguage() === 'pl' ? 'Proszę poprawić błędy w formularzu' : 'Please fix errors in the form');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    // Validate phone
    if (!this.phone) {
      this.phoneError.set(this.i18n.currentLanguage() === 'pl' ? 'Numer telefonu jest wymagany' : 'Phone number is required');
      this.loading.set(false);
      return;
    }

    // Call register service
    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      countryCode: this.countryCode,
      phone: this.phone
    }).subscribe({
      next: () => {
        this.toast.success(this.i18n.currentLanguage() === 'pl' ? 'Rejestracja zakończona pomyślnie!' : 'Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error.set(err.message || (this.i18n.currentLanguage() === 'pl' ? 'Błąd rejestracji' : 'Registration error'));
        this.toast.error(this.i18n.currentLanguage() === 'pl' ? 'Błąd rejestracji' : 'Registration error');
        this.loading.set(false);
      }
    });
  }
}
