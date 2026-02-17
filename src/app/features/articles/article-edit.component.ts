import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService, ToastService, AuthService } from '../../core/services';
import { ArticleDto, UserRole } from '../../core/models';

@Component({
  selector: 'app-article-edit',
  imports: [CommonModule, FormsModule],
  templateUrl: './article-edit.component.html',
  styleUrl: './article-edit.component.css'
})
export class ArticleEditComponent implements OnInit {
  private articleService = inject(ArticleService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  article = signal<ArticleDto | null>(null);
  loading = signal(true);
  submitting = signal(false);

  title = '';
  content = '';

  ngOnInit(): void {
    // Check permissions
    if (!this.authService.hasAnyRole([UserRole.ADMIN, UserRole.MODERATOR])) {
      this.toastService.show('Błąd', 'Brak uprawnień do edycji artykułów', 'error');
      this.router.navigate(['/']);
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadArticle(id);
  }

  loadArticle(id: number): void {
    this.articleService.getArticleById(id).subscribe({
      next: (article) => {
        if (article) {
          this.article.set(article);
          this.title = article.title;
          this.content = article.content;
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.show('Błąd', 'Nie udało się załadować artykułu', 'error');
      }
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.title.trim() || !this.content.trim()) {
      this.toastService.show('Błąd', 'Wszystkie pola są wymagane', 'error');
      return;
    }

    const article = this.article();
    if (!article) return;

    this.submitting.set(true);

    this.articleService.updateArticle({
      id: article.id,
      title: this.title,
      content: this.content
    }).subscribe({
      next: () => {
        this.toastService.show('Sukces', 'Artykuł został zaktualizowany', 'success');
        this.router.navigate(['/articles', article.id]);
      },
      error: () => {
        this.toastService.show('Błąd', 'Nie udało się zaktualizować artykułu', 'error');
        this.submitting.set(false);
      }
    });
  }

  cancel(): void {
    const article = this.article();
    if (article) {
      this.router.navigate(['/articles', article.id]);
    } else {
      this.router.navigate(['/articles']);
    }
  }
}
