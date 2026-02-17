import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ArticleService, AuthService } from '../../core/services';

@Component({
  selector: 'app-article-create',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Create New Article</h1>
      </div>

      <form (ngSubmit)="onSubmit()" class="article-form">
        <div class="form-group">
          <label for="title">Title</label>
          <input
            id="title"
            type="text"
            [(ngModel)]="title"
            name="title"
            required
            placeholder="Enter article title"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="content">Content</label>
          <textarea
            id="content"
            [(ngModel)]="content"
            name="content"
            required
            placeholder="Write your article content here..."
            class="form-control"
            rows="15"
          ></textarea>
          <small class="form-hint">
            Supports markdown formatting: **bold**, *italic*, \`code\`, etc.
          </small>
        </div>

        @if (error()) {
          <div class="alert alert-error">
            {{ error() }}
          </div>
        }

        <div class="form-actions">
          <button type="submit" [disabled]="loading()" class="btn btn-primary">
            {{ loading() ? 'Creating...' : 'Create Article' }}
          </button>
          <button type="button" (click)="cancel()" class="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .header {
      margin-bottom: 2rem;
    }

    .header h1 {
      color: var(--text-primary);
      font-size: 2rem;
      font-weight: 700;
    }

    .article-form {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      padding: 2rem;
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
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-bg);
    }

    textarea.form-control {
      resize: vertical;
      font-family: inherit;
      line-height: 1.6;
    }

    .form-hint {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
    }

    .alert-error {
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
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

    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover {
      background: var(--bg-tertiary);
    }
  `]
})
export class ArticleCreateComponent implements OnInit {
  private articleService = inject(ArticleService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  sectionId = signal<number>(1);
  title = '';
  content = '';
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    // Get sectionId from query params
    this.route.queryParams.subscribe(params => {
      const id = params['sectionId'];
      if (id) {
        this.sectionId.set(Number(id));
      }
    });
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.error.set('You must be logged in to create an article');
      this.loading.set(false);
      return;
    }

    this.articleService.createArticle({
      title: this.title,
      content: this.content,
      sectionId: this.sectionId(),
      authorId: 1 // TODO: Get from current user ID when available from backend
    }).subscribe({
      next: (article) => {
        this.router.navigate(['/articles', article.id]);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to create article');
        this.loading.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/sections']);
  }
}
