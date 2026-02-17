import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { ArticleService, AuthService, I18nService } from '../../core/services';
import { ArticleDto, UserRole } from '../../core/models';
import { LucideAngularModule, User, Calendar, Eye, Heart, ArrowRight, Plus } from 'lucide-angular';

@Component({
  selector: 'app-article-list',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)',
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Articles</h1>
        @if (authService.hasAnyRole([UserRole.ADMIN, UserRole.MODERATOR])) {
          <button (click)="createArticle()" class="btn btn-primary" type="button">
            <lucide-icon [img]="PlusIcon" [size]="18"></lucide-icon>
            Create Article
          </button>
        }
      </div>

      <div class="articles-list" [@listAnimation]="articles().length">
        @for (article of articles(); track article.id) {
          <div class="article-card">
            <div class="article-content" (click)="viewArticle(article.id)">
              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-preview">{{ getPreview(article.content) }}</p>

              <div class="article-meta">
                <div class="meta-left">
                  <span class="article-author" (click)="navigateToProfile(article.authorName); $event.stopPropagation()">
                    <lucide-icon [img]="UserIcon" [size]="14" class="author-icon"></lucide-icon>
                    {{ article.authorName }}
                  </span>
                  <span class="article-date">
                    <lucide-icon [img]="CalendarIcon" [size]="14" class="date-icon"></lucide-icon>
                    {{ formatDate(article.createdAt) }}
                  </span>
                </div>
                <div class="article-stats">
                  <span class="stat-badge views">
                    <lucide-icon [img]="EyeIcon" [size]="14" class="stat-icon"></lucide-icon>
                    {{ article.views }}
                  </span>
                  <span class="stat-badge likes">
                    <lucide-icon [img]="HeartIcon" [size]="14" class="stat-icon"></lucide-icon>
                    {{ article.likes }}
                  </span>
                </div>
              </div>
            </div>

            <div class="article-actions">
              <button (click)="viewArticle(article.id)" class="btn-read" type="button">
                <span class="btn-text">{{ i18n.t('articles.readMore') }}</span>
                <lucide-icon [img]="ArrowRightIcon" [size]="20" class="btn-icon"></lucide-icon>
              </button>
            </div>
          </div>
        }
      </div>

      @if (totalPages() > 0) {
        <div class="pagination">
          <div class="pagination-info">
            {{ i18n.t('pagination.showing') }} {{ currentPage() * pageSize() + 1 }} - {{ Math.min((currentPage() + 1) * pageSize(), totalElements()) }} {{ i18n.t('pagination.of') }} {{ totalElements() }}
          </div>

          <div class="pagination-controls">
            <button (click)="changePage(currentPage() - 1)" [disabled]="currentPage() === 0" class="pagination-btn" type="button">
              {{ i18n.t('pagination.previous') }}
            </button>

            @for (page of pages; track page) {
              <button (click)="changePage(page)" [class.active]="currentPage() === page" class="pagination-btn" type="button">
                {{ page + 1 }}
              </button>
            }

            <button (click)="changePage(currentPage() + 1)" [disabled]="currentPage() === totalPages() - 1" class="pagination-btn" type="button">
              {{ i18n.t('pagination.next') }}
            </button>
          </div>

          <div class="page-size-selector">
            <label>{{ i18n.t('pagination.itemsPerPage') }}</label>
            <select [value]="pageSize()" (change)="changePageSize(+$any($event.target).value)" class="page-size-select">
              @for (size of pageSizeOptions; track size) {
                <option [value]="size">{{ size }}</option>
              }
            </select>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      background: var(--gradient-secondary);
      background-size: 200% 200%;
      animation: gradient-shift 3s ease infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .articles-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .article-card {
      background: var(--bg-primary);
      border: 2px solid var(--border-color);
      border-radius: 1.25rem;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
    }

    .article-card:hover {
      border-color: var(--primary-color);
      box-shadow: 0 12px 40px rgba(245, 87, 108, 0.2);
      transform: translateY(-4px);
    }

    .article-content {
      padding: 2rem;
      cursor: pointer;
      flex: 1;
    }

    .article-title {
      color: var(--text-primary);
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      transition: all 0.3s ease;
      line-height: 1.3;
    }

    .article-card:hover .article-title {
      background: var(--gradient-secondary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .article-preview {
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 0 0 1.5rem 0;
      font-size: 1rem;
    }

    .article-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .meta-left {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .article-author {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--primary-color);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      background: rgba(245, 87, 108, 0.1);
    }

    .article-author:hover {
      background: rgba(245, 87, 108, 0.2);
      transform: translateY(-2px);
    }

    .author-icon {
      display: inline-flex;
    }

    .article-date {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      background: var(--bg-secondary);
    }

    .date-icon {
      display: inline-flex;
    }

    .article-stats {
      display: flex;
      gap: 0.75rem;
    }

    .stat-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .stat-badge.views {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .stat-badge.likes {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .stat-icon {
      display: inline-flex;
    }

    .article-actions {
      padding: 1.25rem 2rem;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);
    }

    .btn-read {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      background: var(--gradient-primary);
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
    }

    .btn-read:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
    }

    .btn-read:active {
      transform: translateY(0);
    }

    .btn-icon {
      display: inline-flex;
      transition: transform 0.3s ease;
    }

    .btn-read:hover .btn-icon {
      transform: translateX(4px);
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-hover);
    }

    .btn lucide-icon {
      display: inline-flex;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      padding: 1.5rem;
      background: var(--bg-primary);
      border-radius: 0.5rem;
      border: 1px solid var(--border-color);
      gap: 1rem;
      flex-wrap: wrap;
    }

    .pagination-info {
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .pagination-controls {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .pagination-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      color: var(--text-primary);
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }

    .pagination-btn:hover:not(:disabled) {
      background: var(--primary-bg);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .pagination-btn.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-size-selector label {
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .page-size-select {
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      color: var(--text-primary);
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .pagination {
        flex-direction: column;
        align-items: stretch;
      }

      .pagination-info {
        text-align: center;
      }

      .pagination-controls {
        justify-content: center;
      }

      .page-size-selector {
        justify-content: center;
      }
    }
  `]
})
export class ArticleListComponent implements OnInit {
  articleService = inject(ArticleService);
  authService = inject(AuthService);
  i18n = inject(I18nService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  articles = signal<ArticleDto[]>([]);
  UserRole = UserRole;
  sectionId: number = 0;
  Math = Math;

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSizeOptions = [5, 10, 20, 50];

  // Lucide icons
  readonly UserIcon = User;
  readonly CalendarIcon = Calendar;
  readonly EyeIcon = Eye;
  readonly HeartIcon = Heart;
  readonly ArrowRightIcon = ArrowRight;
  readonly PlusIcon = Plus;

  ngOnInit(): void {
    this.sectionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadArticles();
  }

  loadArticles(): void {
    this.articleService.getArticlesBySection(this.sectionId, this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.articles.set(response.articles);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
      }
    });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadArticles();
    }
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadArticles();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  getPreview(content: string): string {
    // Strip HTML tags and get plain text preview
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    return plainText.substring(0, 200) + '...';
  }

  viewArticle(id: number): void {
    this.router.navigate(['/articles', id]);
  }

  createArticle(): void {
    this.router.navigate(['/articles/create'], {
      queryParams: { sectionId: this.sectionId }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  navigateToProfile(userName: string): void {
    this.router.navigate(['/profile', userName]);
  }
}
