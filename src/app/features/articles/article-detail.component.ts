import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { ArticleService, CommentService, AuthService, ToastService, I18nService } from '../../core/services';
import { ArticleDto, CommentDto, UserRole } from '../../core/models';
import { LucideAngularModule, User, Calendar, Eye, Heart, MessageCircle, Edit, Ban, Check, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('commentsAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(60, [
            animate('0.5s cubic-bezier(0.35, 0, 0.25, 1)',
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.css'
})
export class ArticleDetailComponent implements OnInit {
  private articleService = inject(ArticleService);
  private commentService = inject(CommentService);
  authService = inject(AuthService);
  i18n = inject(I18nService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  article = signal<ArticleDto | null>(null);
  comments = signal<CommentDto[]>([]);
  newComment = '';
  UserRole = UserRole;

  // Lucide icons
  readonly UserIcon = User;
  readonly CalendarIcon = Calendar;
  readonly EyeIcon = Eye;
  readonly HeartIcon = Heart;
  readonly MessageCircleIcon = MessageCircle;
  readonly EditIcon = Edit;
  readonly BanIcon = Ban;
  readonly CheckIcon = Check;
  readonly AlertCircleIcon = AlertCircle;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadArticle(id);
    this.loadComments(id);
  }

  loadArticle(id: number): void {
    this.articleService.getArticleById(id).subscribe({
      next: (article) => {
        if (article) {
          this.article.set(article);
          this.articleService.incrementViews(id);
        }
      }
    });
  }

  loadComments(articleId: number): void {
    this.commentService.getCommentsByArticle(articleId).subscribe({
      next: (comments) => this.comments.set(comments)
    });
  }

  formatContent(content: string): string {
    return content.replace(/\n/g, '<br>');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  likeArticle(): void {
    const article = this.article();
    if (article) {
      this.articleService.likeArticle(article.id).subscribe({
        next: (updatedArticle) => {
          this.article.set(updatedArticle);
          const message = this.i18n.currentLanguage() === 'pl'
            ? 'Artykuł został polubiony!'
            : 'Article liked!';
          this.toastService.success(message);
        }
      });
    }
  }

  postComment(): void {
    if (!this.newComment.trim()) return;

    const articleId = this.article()?.id;
    if (!articleId) return;

    this.commentService.createComment({
      value: this.newComment,
      articleId
    }).subscribe({
      next: () => {
        this.newComment = '';
        this.loadComments(articleId);
      }
    });
  }

  likeComment(id: number): void {
    this.commentService.likeComment(id).subscribe({
      next: (updatedComment) => {
        this.comments.update(comments => {
          const index = comments.findIndex(c => c.id === id);
          if (index !== -1) {
            const newComments = [...comments];
            newComments[index] = updatedComment;
            return newComments;
          }
          return comments;
        });
        const message = this.i18n.currentLanguage() === 'pl'
          ? 'Komentarz został polubiony!'
          : 'Comment liked!';
        this.toastService.success(message);
      }
    });
  }

  toggleBlockComment(comment: CommentDto): void {
    this.commentService.blockComment({
      id: comment.id,
      blocked: !comment.blocked
    }).subscribe({
      next: () => {
        const articleId = this.article()?.id;
        if (articleId) {
          this.loadComments(articleId);
        }
      }
    });
  }

  canBlockComments(): boolean {
    const user = this.authService.currentUser();
    return user?.userRoles.some(role =>
      ['ADMIN', 'MODERATOR', 'HELPER'].includes(role)
    ) ?? false;
  }

  navigateToProfile(userName: string): void {
    this.router.navigate(['/profile', userName]);
  }

  canEditArticle(): boolean {
    return this.authService.hasAnyRole([UserRole.ADMIN, UserRole.MODERATOR]);
  }

  editArticle(): void {
    const article = this.article();
    if (article) {
      this.router.navigate(['/articles/edit', article.id]);
    }
  }

  toggleDisableArticle(): void {
    const article = this.article();
    if (!article) return;

    this.articleService.disableArticle({
      id: article.id,
      disabled: !article.disabled
    }).subscribe({
      next: () => {
        this.toastService.show(
          'Sukces',
          article.disabled ? 'Artykuł został włączony' : 'Artykuł został wyłączony',
          'success'
        );
        this.loadArticle(article.id);
      },
      error: () => {
        this.toastService.show(
          'Błąd',
          'Nie udało się zmienić statusu artykułu',
          'error'
        );
      }
    });
  }
}
