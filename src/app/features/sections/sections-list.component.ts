import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { SectionService, AuthService, I18nService } from '../../core/services';
import { SectionDto, UserRole } from '../../core/models';
import { LucideAngularModule, Eye, Plus } from 'lucide-angular';

@Component({
  selector: 'app-sections-list',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(80, [
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
        <div class="header-content">
          <div>
            <h1>{{ i18n.t('sections.title') }}</h1>
            <p>{{ i18n.t('sections.subtitle') }}</p>
          </div>
          @if (authService.hasRole(UserRole.ADMIN)) {
            <a routerLink="/sections/create" class="btn btn-primary">
              <lucide-icon [img]="PlusIcon" [size]="20" class="btn-icon"></lucide-icon>
              {{ i18n.t('sections.create') }}
            </a>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="loading">{{ i18n.t('sections.loading') }}</div>
      } @else {
        <div class="sections-grid" [@listAnimation]="sections().length">
          @for (section of sections(); track section.id) {
            <div class="section-card">
              <div (click)="navigateToSection(section.id)" style="cursor: pointer;">
                <div class="section-type">{{ section.type }}</div>
                <h3 class="section-title">{{ section.title }}</h3>
                <p class="section-description">{{ section.description }}</p>
              </div>
              <div class="section-footer">
                <div class="section-info">
                  <span class="section-author" (click)="navigateToProfile(section.creatorName)">
                    {{ section.creatorName }}
                  </span>
                  <span class="section-date">{{ formatDate(section.createdAt) }}</span>
                  <span class="section-views">
                    <lucide-icon [img]="EyeIcon" [size]="14" class="view-icon"></lucide-icon>
                    {{ section.views }} {{ i18n.t('sections.views') }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 0) {
          <div class="pagination">
            <div class="pagination-info">
              {{ i18n.t('pagination.showing') }} {{ currentPage() * pageSize() + 1 }} - {{ Math.min((currentPage() + 1) * pageSize(), totalElements()) }} {{ i18n.t('pagination.of') }} {{ totalElements() }}
            </div>

            <div class="pagination-controls">
              <button
                (click)="changePage(currentPage() - 1)"
                [disabled]="currentPage() === 0"
                class="pagination-btn"
              >
                {{ i18n.t('pagination.previous') }}
              </button>

              @for (page of pages; track page) {
                <button
                  (click)="changePage(page)"
                  [class.active]="currentPage() === page"
                  class="pagination-btn"
                >
                  {{ page + 1 }}
                </button>
              }

              <button
                (click)="changePage(currentPage() + 1)"
                [disabled]="currentPage() === totalPages() - 1"
                class="pagination-btn"
              >
                {{ i18n.t('pagination.next') }}
              </button>
            </div>

            <div class="page-size-selector">
              <label>{{ i18n.t('pagination.itemsPerPage') }}</label>
              <select
                [value]="pageSize()"
                (change)="changePageSize(+$any($event.target).value)"
                class="page-size-select"
              >
                @for (size of pageSizeOptions; track size) {
                  <option [value]="size">{{ size }}</option>
                }
              </select>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .header {
      margin-bottom: 3rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .header h1 {
      background: var(--gradient-hero);
      background-size: 200% 200%;
      animation: gradient-shift 3s ease infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .header p {
      color: var(--text-secondary);
      font-size: 1.125rem;
      margin: 0;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--gradient-primary);
      color: white;
      box-shadow: var(--shadow-md);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .btn-icon {
      display: inline-flex;
      align-items: center;
    }

    .btn-icon lucide-icon {
      display: inline-flex;
    }

    .section-views {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .view-icon {
      display: inline-flex;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }

    .loading {
      text-align: center;
      color: var(--text-secondary);
      padding: 3rem;
    }

    .sections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .section-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      padding: 1.5rem;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .section-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gradient-primary);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    .section-card:hover::before {
      transform: scaleX(1);
    }

    .section-card:hover {
      border-color: transparent;
      box-shadow: var(--shadow-colored);
      transform: translateY(-8px);
    }

    .section-type {
      display: inline-block;
      background: var(--gradient-accent);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.4rem 0.9rem;
      border-radius: 1rem;
      margin-bottom: 1rem;
      box-shadow: var(--shadow-sm);
      max-width: 100%;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .section-title {
      color: var(--text-primary);
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.75rem 0;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .section-description {
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0 0 1rem 0;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .section-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .section-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      word-wrap: break-word;
      overflow-wrap: break-word;
      min-width: 0;
    }

    .section-author {
      color: var(--primary-color);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .section-author:hover {
      text-decoration: underline;
      opacity: 0.8;
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
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .page-size-select {
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      border-radius: 0.375rem;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .pagination {
        flex-direction: column;
        align-items: stretch;
      }

      .pagination-controls {
        justify-content: center;
      }

      .pagination-info,
      .page-size-selector {
        text-align: center;
      }
    }
  `]
})
export class SectionsListComponent implements OnInit {
  private sectionService = inject(SectionService);
  authService = inject(AuthService);
  i18n = inject(I18nService);
  private router = inject(Router);

  sections = signal<SectionDto[]>([]);
  loading = signal(true);
  UserRole = UserRole;
  Math = Math;

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSizeOptions = [5, 10, 20, 50];

  // Lucide icons
  readonly EyeIcon = Eye;
  readonly PlusIcon = Plus;

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections(): void {
    this.sectionService.getSections(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.sections.set(response.sections);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadSections();
    }
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadSections();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  navigateToSection(id: number): void {
    this.router.navigate(['/sections', id]);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  navigateToProfile(userName: string): void {
    this.router.navigate(['/profile', userName]);
  }
}
