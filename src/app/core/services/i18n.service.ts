import { Injectable, signal } from '@angular/core';

export type Language = 'pl' | 'en';

interface Translations {
  [key: string]: {
    pl: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.sections': { pl: 'Sekcje', en: 'Sections' },
  'nav.profile': { pl: 'Profil', en: 'Profile' },
  'nav.admin': { pl: 'Admin', en: 'Admin' },
  'nav.login': { pl: 'Zaloguj', en: 'Login' },
  'nav.register': { pl: 'Zarejestruj', en: 'Register' },
  'nav.logout': { pl: 'Wyloguj', en: 'Logout' },

  // Login
  'login.title': { pl: 'Witaj ponownie', en: 'Welcome Back' },
  'login.subtitle': { pl: 'Zaloguj się na swoje konto', en: 'Sign in to your account' },
  'login.email': { pl: 'Email', en: 'Email' },
  'login.password': { pl: 'Hasło', en: 'Password' },
  'login.submit': { pl: 'Zaloguj się', en: 'Sign In' },
  'login.loading': { pl: 'Logowanie...', en: 'Signing in...' },

  // Register
  'register.title': { pl: 'Utwórz konto', en: 'Create Account' },
  'register.subtitle': { pl: 'Zarejestruj się aby rozpocząć', en: 'Register to get started' },
  'register.username': { pl: 'Nazwa użytkownika', en: 'Username' },
  'register.usernamePlaceholder': { pl: 'Wprowadź nazwę użytkownika', en: 'Enter your username' },
  'register.email': { pl: 'Email', en: 'Email' },
  'register.emailPlaceholder': { pl: 'Wprowadź email', en: 'Enter your email' },
  'register.password': { pl: 'Hasło', en: 'Password' },
  'register.passwordPlaceholder': { pl: 'Wprowadź hasło', en: 'Enter your password' },
  'register.confirmPassword': { pl: 'Potwierdź hasło', en: 'Confirm Password' },
  'register.confirmPasswordPlaceholder': { pl: 'Wprowadź hasło ponownie', en: 'Enter password again' },
  'register.passwordsMatch': { pl: 'Hasła są zgodne', en: 'Passwords match' },
  'register.submit': { pl: 'Zarejestruj się', en: 'Register' },
  'register.registering': { pl: 'Rejestrowanie...', en: 'Registering...' },
  'register.haveAccount': { pl: 'Masz już konto?', en: 'Already have an account?' },
  'register.loginHere': { pl: 'Zaloguj się tutaj', en: 'Login here' },

  // Sections
  'sections.title': { pl: 'Sekcje Bloga', en: 'Blog Sections' },
  'sections.subtitle': { pl: 'Odkryj różne tematy i artykuły', en: 'Explore different topics and articles' },
  'sections.views': { pl: 'wyświetleń', en: 'views' },
  'sections.create': { pl: 'Utwórz Sekcję', en: 'Create Section' },
  'sections.loading': { pl: 'Ładowanie sekcji...', en: 'Loading sections...' },

  // Articles
  'articles.title': { pl: 'Artykuły', en: 'Articles' },
  'articles.create': { pl: 'Utwórz Artykuł', en: 'Create Article' },
  'articles.readMore': { pl: 'Czytaj więcej', en: 'Read More' },
  'articles.comments': { pl: 'Komentarze', en: 'Comments' },
  'articles.commentsCount': { pl: 'Komentarzy', en: 'Comments' },
  'articles.postComment': { pl: 'Dodaj komentarz', en: 'Post Comment' },
  'articles.commentPlaceholder': { pl: 'Napisz komentarz...', en: 'Write a comment...' },
  'articles.edit': { pl: 'Edytuj', en: 'Edit' },
  'articles.disable': { pl: 'Wyłącz', en: 'Disable' },
  'articles.enable': { pl: 'Włącz', en: 'Enable' },
  'articles.block': { pl: 'Zablokuj', en: 'Block' },
  'articles.unblock': { pl: 'Odblokuj', en: 'Unblock' },
  'articles.newArticle': { pl: 'Nowy Artykuł', en: 'New Article' },
  'articles.articleTitle': { pl: 'Tytuł', en: 'Title' },
  'articles.content': { pl: 'Treść', en: 'Content' },
  'articles.contentPlaceholder': { pl: 'Napisz treść artykułu...', en: 'Write your article content...' },
  'articles.cancel': { pl: 'Anuluj', en: 'Cancel' },
  'articles.submit': { pl: 'Utwórz Artykuł', en: 'Create Article' },
  'articles.creating': { pl: 'Tworzenie...', en: 'Creating...' },

  // Profile
  'profile.title': { pl: 'Ustawienia Profilu', en: 'Profile Settings' },
  'profile.personalInfo': { pl: 'Informacje Osobiste', en: 'Personal Information' },
  'profile.username': { pl: 'Nazwa użytkownika', en: 'Username' },
  'profile.countryCode': { pl: 'Kod kraju', en: 'Country Code' },
  'profile.phone': { pl: 'Numer telefonu', en: 'Phone Number' },
  'profile.updateProfile': { pl: 'Zaktualizuj Profil', en: 'Update Profile' },
  'profile.changePassword': { pl: 'Zmień Hasło', en: 'Change Password' },
  'profile.currentPassword': { pl: 'Obecne hasło', en: 'Current Password' },
  'profile.newPassword': { pl: 'Nowe hasło', en: 'New Password' },
  'profile.confirmPassword': { pl: 'Potwierdź nowe hasło', en: 'Confirm New Password' },
  'profile.roles': { pl: 'Role', en: 'Roles' },
  'profile.posts': { pl: 'Posty', en: 'Posts' },
  'profile.joined': { pl: 'Dołączył', en: 'Joined' },

  // Admin
  'admin.title': { pl: 'Panel Administracyjny', en: 'Admin Panel' },
  'admin.users': { pl: 'Użytkownicy', en: 'Users' },
  'admin.stats': { pl: 'Statystyki', en: 'Statistics' },
  'admin.userManagement': { pl: 'Zarządzanie Użytkownikami', en: 'User Management' },
  'admin.editRoles': { pl: 'Edytuj Role', en: 'Edit Roles' },
  'admin.editUserRoles': { pl: 'Edytuj Role Użytkownika', en: 'Edit User Roles' },
  'admin.save': { pl: 'Zapisz', en: 'Save' },
  'admin.totalSections': { pl: 'Wszystkie Sekcje', en: 'Total Sections' },
  'admin.totalArticles': { pl: 'Wszystkie Artykuły', en: 'Total Articles' },
  'admin.totalUsers': { pl: 'Wszyscy Użytkownicy', en: 'Total Users' },
  'admin.totalViews': { pl: 'Wszystkie Wyświetlenia', en: 'Total Views' },
  'admin.searchByEmail': { pl: 'Szukaj po Email', en: 'Search by Email' },
  'admin.enterEmail': { pl: 'Wprowadź email...', en: 'Enter email...' },
  'admin.filterByRole': { pl: 'Filtruj po Roli', en: 'Filter by Role' },
  'admin.allRoles': { pl: 'Wszystkie Role', en: 'All Roles' },
  'admin.applyFilters': { pl: 'Zastosuj Filtry', en: 'Apply Filters' },
  'admin.clear': { pl: 'Wyczyść', en: 'Clear' },
  'admin.username': { pl: 'Nazwa użytkownika', en: 'Username' },
  'admin.email': { pl: 'Email', en: 'Email' },
  'admin.phone': { pl: 'Telefon', en: 'Phone' },
  'admin.roles': { pl: 'Role', en: 'Roles' },
  'admin.actions': { pl: 'Akcje', en: 'Actions' },

  // Common
  'common.loading': { pl: 'Ładowanie...', en: 'Loading...' },
  'common.save': { pl: 'Zapisz', en: 'Save' },
  'common.cancel': { pl: 'Anuluj', en: 'Cancel' },
  'common.delete': { pl: 'Usuń', en: 'Delete' },
  'common.edit': { pl: 'Edytuj', en: 'Edit' },
  'common.block': { pl: 'Zablokuj', en: 'Block' },
  'common.unblock': { pl: 'Odblokuj', en: 'Unblock' },

  // Pagination
  'pagination.showing': { pl: 'Pokazuję', en: 'Showing' },
  'pagination.of': { pl: 'z', en: 'of' },
  'pagination.previous': { pl: 'Poprzednia', en: 'Previous' },
  'pagination.next': { pl: 'Następna', en: 'Next' },
  'pagination.itemsPerPage': { pl: 'Elementów na stronę:', en: 'Items per page:' },

  // Toasts
  'toast.loginSuccess': { pl: 'Zalogowano pomyślnie!', en: 'Logged in successfully!' },
  'toast.loginError': { pl: 'Błąd logowania', en: 'Login failed' },
  'toast.logoutSuccess': { pl: 'Wylogowano pomyślnie', en: 'Logged out successfully' },
  'toast.profileUpdated': { pl: 'Profil zaktualizowany!', en: 'Profile updated!' },
  'toast.passwordChanged': { pl: 'Hasło zmienione!', en: 'Password changed!' },
  'toast.articleCreated': { pl: 'Artykuł utworzony!', en: 'Article created!' },
  'toast.sectionCreated': { pl: 'Sekcja utworzona!', en: 'Section created!' },
  'toast.themeChanged': { pl: 'Motyw zmieniony!', en: 'Theme changed!' },
  'toast.commentPosted': { pl: 'Komentarz dodany!', en: 'Comment posted!' },
  'toast.commentBlocked': { pl: 'Komentarz zablokowany', en: 'Comment blocked' },
  'toast.commentUnblocked': { pl: 'Komentarz odblokowany', en: 'Comment unblocked' },
  'toast.userRolesUpdated': { pl: 'Role użytkownika zaktualizowane', en: 'User roles updated' },
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguageSignal = signal<Language>('pl');
  private readonly langKey = 'app_language';

  constructor() {
    this.loadLanguage();
  }

  get currentLanguage() {
    return this.currentLanguageSignal.asReadonly();
  }

  translate(key: string): string {
    const translation = translations[key];
    if (!translation) {
      return key;
    }
    return translation[this.currentLanguageSignal()];
  }

  t(key: string): string {
    return this.translate(key);
  }

  setLanguage(lang: Language): void {
    this.currentLanguageSignal.set(lang);
    localStorage.setItem(this.langKey, lang);
  }

  toggleLanguage(): void {
    const newLang = this.currentLanguageSignal() === 'pl' ? 'en' : 'pl';
    this.setLanguage(newLang);
  }

  private loadLanguage(): void {
    const saved = localStorage.getItem(this.langKey) as Language;
    if (saved && (saved === 'pl' || saved === 'en')) {
      this.currentLanguageSignal.set(saved);
    }
  }
}
