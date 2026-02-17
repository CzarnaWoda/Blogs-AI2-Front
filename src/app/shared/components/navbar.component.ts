import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, ThemeService } from '../../core/services';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../core/services/toast.service';
import { UserRole } from '../../core/models';
import { LucideAngularModule, Sun, Moon, Languages } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <nav class="navbar">
      <div class="container">
        <div class="nav-brand">
          <a routerLink="/" class="brand-link">
            <span class="brand-icon">📝</span>
            <span class="brand-name">Blogs AI</span>
          </a>
        </div>

        <!-- Desktop Navigation -->
        <div class="nav-links desktop-only">
          <a routerLink="/sections" routerLinkActive="active" class="nav-link">{{ i18n.t('nav.sections') }}</a>
          @if (authService.currentUser()) {
            <a routerLink="/profile" routerLinkActive="active" class="nav-link">{{ i18n.t('nav.profile') }}</a>
            @if (authService.hasRole(UserRole.ADMIN)) {
              <a routerLink="/admin" routerLinkActive="active" class="nav-link">{{ i18n.t('nav.admin') }}</a>
            }
          }
        </div>

        <div class="nav-actions">
          <button (click)="toggleLanguage()" class="lang-toggle" type="button" [title]="i18n.currentLanguage() === 'pl' ? 'Polski' : 'English'">
            <lucide-icon [img]="LanguagesIcon" [size]="20"></lucide-icon>
          </button>

          <button (click)="toggleTheme()" class="theme-toggle" type="button">
            @if (themeService.theme() === 'light') {
              <lucide-icon [img]="MoonIcon" [size]="20"></lucide-icon>
            } @else {
              <lucide-icon [img]="SunIcon" [size]="20"></lucide-icon>
            }
          </button>

          @if (authService.currentUser(); as user) {
            <div class="user-menu desktop-only">
              <a [routerLink]="['/profile', user.userName]" class="user-name-link">{{ user.userName }}</a>
              <button (click)="logout()" class="btn btn-secondary" type="button">{{ i18n.t('nav.logout') }}</button>
            </div>
          } @else {
            <a routerLink="/login" class="btn btn-primary desktop-only">{{ i18n.t('nav.login') }}</a>
            <a routerLink="/register" class="btn btn-accent desktop-only">{{ i18n.t('nav.register') }}</a>
          }

          <!-- Hamburger Menu Button -->
          <button (click)="toggleMobileMenu()" class="hamburger mobile-only" [class.active]="mobileMenuOpen()" type="button">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen()) {
        <div class="mobile-menu" (click)="closeMobileMenu()">
          <div class="mobile-menu-content" (click)="$event.stopPropagation()">
            <a routerLink="/sections" routerLinkActive="active" class="mobile-link" (click)="closeMobileMenu()">{{ i18n.t('nav.sections') }}</a>
            @if (authService.currentUser()) {
              <a routerLink="/profile" routerLinkActive="active" class="mobile-link" (click)="closeMobileMenu()">{{ i18n.t('nav.profile') }}</a>
              @if (authService.hasRole(UserRole.ADMIN)) {
                <a routerLink="/admin" routerLinkActive="active" class="mobile-link" (click)="closeMobileMenu()">{{ i18n.t('nav.admin') }}</a>
              }
              <div class="mobile-user">
                <a [routerLink]="['/profile', authService.currentUser()?.userName]" class="mobile-user-name-link" (click)="closeMobileMenu()">{{ authService.currentUser()?.userName }}</a>
                <button (click)="logout()" class="btn btn-secondary btn-block" type="button">{{ i18n.t('nav.logout') }}</button>
              </div>
            } @else {
              <a routerLink="/login" class="btn btn-primary btn-block" (click)="closeMobileMenu()">{{ i18n.t('nav.login') }}</a>
              <a routerLink="/register" class="btn btn-accent btn-block" (click)="closeMobileMenu()">{{ i18n.t('nav.register') }}</a>
            }
          </div>
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      background: var(--bg-primary);
      backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: var(--shadow-md);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .nav-brand {
      flex-shrink: 0;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--gradient-hero);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-decoration: none;
      font-size: 1.25rem;
      font-weight: 700;
      transition: transform 0.3s ease;
    }

    .brand-link:hover {
      transform: scale(1.05);
    }

    .brand-icon {
      font-size: 1.5rem;
      filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
    }

    .nav-links {
      display: flex;
      gap: 1.5rem;
      flex: 1;
    }

    .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      transition: all 0.2s;
    }

    .nav-link:hover {
      color: var(--text-primary);
      background: var(--bg-secondary);
    }

    .nav-link.active {
      color: var(--primary-color);
      background: var(--primary-bg);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .lang-toggle,
    .theme-toggle {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      position: relative;
      overflow: hidden;
    }

    .lang-toggle lucide-icon,
    .theme-toggle lucide-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lang-toggle::before,
    .theme-toggle::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--gradient-accent);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    .lang-toggle:hover::before,
    .theme-toggle:hover::before {
      opacity: 0.1;
    }

    .lang-toggle:hover,
    .theme-toggle:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: var(--shadow-md);
      border-color: transparent;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-name-link {
      color: var(--text-primary);
      font-weight: 600;
      text-decoration: none;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      transition: all 0.2s;
    }

    .user-name-link:hover {
      color: var(--primary-color);
      background: var(--primary-bg);
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
      display: inline-block;
      position: relative;
      overflow: hidden;
    }

    .btn-primary {
      background: var(--gradient-primary);
      background-size: 200% 200%;
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-primary:hover {
      animation: gradient-shift 2s ease infinite;
      transform: translateY(-2px);
      box-shadow: var(--shadow-colored);
    }

    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover {
      background: var(--bg-tertiary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .btn-accent {
      background: var(--gradient-secondary);
      background-size: 200% 200%;
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-accent:hover {
      animation: gradient-shift 2s ease infinite;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 87, 108, 0.4);
    }

    .btn-block {
      width: 100%;
    }

    /* Desktop Only - visible by default */
    .desktop-only {
      display: flex;
    }

    /* Mobile Only - hidden by default */
    .mobile-only {
      display: none;
    }

    /* Hamburger Menu */
    .hamburger {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      display: none;
      flex-direction: column;
      gap: 0.25rem;
      z-index: 1200;
      position: relative;
    }

    .hamburger span {
      width: 1.5rem;
      height: 3px;
      background: var(--text-primary);
      transition: all 0.3s;
      border-radius: 2px;
      display: block;
    }

    .hamburger.active span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    .hamburger.active span:nth-child(2) {
      opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
    }

    /* Mobile Menu Overlay */
    .mobile-menu {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1100;
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .mobile-menu-content {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 80%;
      max-width: 320px;
      min-height: 100vh;
      background: var(--bg-primary);
      border-left: 1px solid var(--border-color);
      padding: 4rem 1.5rem 2rem;
      overflow-y: auto;
      animation: slideIn 0.3s;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      z-index: 1101;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .mobile-link {
      color: var(--text-primary);
      text-decoration: none;
      font-weight: 600;
      padding: 1rem 1rem;
      border-radius: 0.375rem;
      transition: all 0.2s;
      display: block;
      font-size: 1rem;
    }

    .mobile-link:hover {
      background: var(--bg-secondary);
    }

    .mobile-link.active {
      color: var(--primary-color);
      background: var(--primary-bg);
    }

    .mobile-user {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .mobile-user-name-link {
      color: var(--text-primary);
      font-weight: 600;
      font-size: 1.125rem;
      text-decoration: none;
      padding: 0.75rem;
      border-radius: 0.5rem;
      transition: all 0.2s;
      display: block;
    }

    .mobile-user-name-link:hover {
      color: var(--primary-color);
      background: var(--primary-bg);
    }

    @media (max-width: 768px) {
      .desktop-only {
        display: none !important;
      }

      .mobile-only {
        display: flex !important;
      }

      .hamburger {
        display: flex !important;
      }

      .nav-actions {
        gap: 0.5rem;
      }

      .nav-links {
        display: none !important;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  i18n = inject(I18nService);
  private toast = inject(ToastService);
  private router = inject(Router);
  UserRole = UserRole;

  mobileMenuOpen = signal(false);

  // Lucide icons
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;
  readonly LanguagesIcon = Languages;

  toggleTheme(): void {
    this.themeService.toggleTheme();
    const theme = this.themeService.theme();
    this.toast.info(this.i18n.t('toast.themeChanged') + ' ' + (theme === 'dark' ? '🌙' : '☀️'));
  }

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
    const lang = this.i18n.currentLanguage();
    const message = lang === 'pl' ? 'Zmieniono język na Polski 🇵🇱' : 'Language changed to English 🇬🇧';
    this.toast.info(message);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.toast.success(this.i18n.t('toast.logoutSuccess'));
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }
}
