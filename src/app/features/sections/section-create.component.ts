import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SectionService, I18nService, ToastService } from '../../core/services';

@Component({
  selector: 'app-section-create',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ i18n.currentLanguage() === 'pl' ? 'Utwórz Nową Sekcję' : 'Create New Section' }}</h1>
      </div>

      <form (ngSubmit)="onSubmit()" class="section-form gradient-card">
        <div class="form-group">
          <label for="title">{{ i18n.currentLanguage() === 'pl' ? 'Tytuł' : 'Title' }}</label>
          <input
            id="title"
            type="text"
            [(ngModel)]="title"
            name="title"
            required
            placeholder="{{ i18n.currentLanguage() === 'pl' ? 'Wprowadź tytuł sekcji' : 'Enter section title' }}"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="description">{{ i18n.currentLanguage() === 'pl' ? 'Opis' : 'Description' }}</label>
          <textarea
            id="description"
            [(ngModel)]="description"
            name="description"
            required
            placeholder="{{ i18n.currentLanguage() === 'pl' ? 'Opisz tę sekcję...' : 'Describe this section...' }}"
            class="form-control"
            rows="4"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="type">{{ i18n.currentLanguage() === 'pl' ? 'Typ' : 'Type' }}</label>
          <select
            id="type"
            [(ngModel)]="type"
            name="type"
            class="form-control"
          >
            <option value="TECHNOLOGY">{{ i18n.currentLanguage() === 'pl' ? 'Technologia' : 'Technology' }}</option>
            <option value="DEVOPS">DevOps</option>
            <option value="SECURITY">{{ i18n.currentLanguage() === 'pl' ? 'Bezpieczeństwo' : 'Security' }}</option>
            <option value="DESIGN">Design</option>
            <option value="OTHER">{{ i18n.currentLanguage() === 'pl' ? 'Inne' : 'Other' }}</option>
          </select>
        </div>

        @if (error()) {
          <div class="alert alert-error">
            {{ error() }}
          </div>
        }

        <div class="form-actions">
          <button type="submit" [disabled]="loading()" class="btn btn-primary">
            {{ loading() ? (i18n.currentLanguage() === 'pl' ? 'Tworzenie...' : 'Creating...') : (i18n.currentLanguage() === 'pl' ? 'Utwórz Sekcję' : 'Create Section') }}
          </button>
          <button type="button" (click)="cancel()" class="btn btn-secondary">
            {{ i18n.currentLanguage() === 'pl' ? 'Anuluj' : 'Cancel' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      min-height: calc(100vh - 80px);
    }

    .header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .header h1 {
      color: var(--text-primary);
      font-size: 2.5rem;
      font-weight: 700;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      padding: 2.5rem;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
    }

    .gradient-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gradient-primary);
    }

    .section-form {
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

    .form-control {
      padding: 0.875rem;
      border: 2px solid var(--border-color);
      border-radius: 0.5rem;
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 4px var(--primary-bg);
      transform: translateY(-2px);
    }

    textarea.form-control {
      resize: vertical;
      line-height: 1.6;
    }

    select.form-control {
      cursor: pointer;
    }

    .alert {
      padding: 1rem 1.25rem;
      border-radius: 0.5rem;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .alert-error {
      background: linear-gradient(135deg, #fee 0%, #fdd 100%);
      color: #c33;
      border: 2px solid #fcc;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .btn {
      padding: 0.875rem 1.75rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
      font-size: 1rem;
      position: relative;
      overflow: hidden;
    }

    .btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    .btn:hover::before {
      width: 300px;
      height: 300px;
    }

    .btn-primary {
      background: var(--gradient-primary);
      color: white;
      box-shadow: var(--shadow-md);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 2px solid var(--border-color);
    }

    .btn-secondary:hover {
      background: var(--bg-tertiary);
      border-color: var(--text-secondary);
      transform: translateY(-2px);
    }
  `]
})
export class SectionCreateComponent {
  private sectionService = inject(SectionService);
  private router = inject(Router);
  i18n = inject(I18nService);
  private toast = inject(ToastService);

  title = '';
  description = '';
  type = 'TECHNOLOGY';
  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    if (!this.title.trim() || !this.description.trim()) {
      this.error.set(this.i18n.currentLanguage() === 'pl' ? 'Wypełnij wszystkie pola' : 'Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.sectionService.createSection({
      title: this.title,
      description: this.description,
      type: this.type
    }).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('toast.sectionCreated'));
        this.router.navigate(['/sections']);
      },
      error: (err) => {
        this.error.set(err.message || (this.i18n.currentLanguage() === 'pl' ? 'Nie udało się utworzyć sekcji' : 'Failed to create section'));
        this.loading.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/sections']);
  }
}
