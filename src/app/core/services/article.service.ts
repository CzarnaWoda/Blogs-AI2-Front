import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ArticleDto, CreateArticleRequest, UpdateArticleRequest, DisableArticleRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/article';
  private articlesSignal = signal<ArticleDto[]>([]);

  constructor() {}

  get articles() {
    return this.articlesSignal.asReadonly();
  }

  getArticles(page: number = 0, size: number = 100): Observable<{ articles: ArticleDto[], totalElements: number, totalPages: number }> {
    return this.http.get<any>(`${this.apiUrl}/articles`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      map(response => ({
        articles: response.data.articles || response.data.content || response.data || [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0
      })),
      tap(data => this.articlesSignal.set(data.articles)),
      catchError(error => {
        console.error('Get articles error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch articles'));
      })
    );
  }

  getArticleById(id: number): Observable<ArticleDto | undefined> {
    return this.http.get<any>(`${this.apiUrl}/id/${id}`).pipe(
      map(response => response.data.article || response.data),
      catchError(error => {
        console.error('Get article error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch article'));
      })
    );
  }

  getArticleByTitle(title: string): Observable<ArticleDto | undefined> {
    return this.http.get<any>(`${this.apiUrl}/title/${title}`).pipe(
      map(response => response.data.article || response.data),
      catchError(error => {
        console.error('Get article by title error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch article'));
      })
    );
  }

  getArticlesBySection(sectionId: number, page: number = 0, size: number = 100): Observable<{ articles: ArticleDto[], totalElements: number, totalPages: number }> {
    return this.http.get<any>(`${this.apiUrl}/section/${sectionId}`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      map(response => ({
        articles: response.data.articles || response.data.content || response.data || [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0
      })),
      tap(data => this.articlesSignal.set(data.articles)),
      catchError(error => {
        console.error('Get articles by section error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch articles'));
      })
    );
  }

  getArticlesByAuthor(authorId: number): Observable<ArticleDto[]> {
    return this.http.get<any>(`${this.apiUrl}/author/${authorId}`).pipe(
      map(response => response.data.articles || response.data.content || response.data),
      catchError(error => {
        console.error('Get articles by author error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch articles'));
      })
    );
  }

  createArticle(request: CreateArticleRequest): Observable<ArticleDto> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map(response => response.data.article || response.data),
      tap(article => {
        this.articlesSignal.update(articles => [...articles, article]);
      }),
      catchError(error => {
        console.error('Create article error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to create article'));
      })
    );
  }

  updateArticle(request: UpdateArticleRequest): Observable<ArticleDto> {
    return this.http.put<any>(this.apiUrl, request).pipe(
      map(response => response.data.article || response.data),
      tap(article => {
        this.articlesSignal.update(articles => {
          const index = articles.findIndex(a => a.id === article.id);
          if (index !== -1) {
            const newArticles = [...articles];
            newArticles[index] = article;
            return newArticles;
          }
          return articles;
        });
      }),
      catchError(error => {
        console.error('Update article error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to update article'));
      })
    );
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.articlesSignal.update(articles => articles.filter(a => a.id !== id));
      }),
      catchError(error => {
        console.error('Delete article error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to delete article'));
      })
    );
  }

  likeArticle(id: number): Observable<ArticleDto> {
    return this.http.patch<any>(`${this.apiUrl}/like`, null, {
      params: { id: id.toString() }
    }).pipe(
      map(response => response.data.article),
      tap(updatedArticle => {
        this.articlesSignal.update(articles => {
          const index = articles.findIndex(a => a.id === id);
          if (index !== -1) {
            const newArticles = [...articles];
            newArticles[index] = updatedArticle;
            return newArticles;
          }
          return articles;
        });
      }),
      catchError(error => {
        console.error('Like article error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to like article'));
      })
    );
  }

  incrementViews(id: number): void {
    this.articlesSignal.update(articles => {
      const index = articles.findIndex(a => a.id === id);
      if (index !== -1) {
        const newArticles = [...articles];
        newArticles[index] = {
          ...newArticles[index],
          views: newArticles[index].views + 1
        };
        return newArticles;
      }
      return articles;
    });
  }

  disableArticle(request: DisableArticleRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/disable/${request.id}`, null).pipe(
      tap(() => {
        this.articlesSignal.update(articles => {
          const index = articles.findIndex(a => a.id === request.id);
          if (index !== -1) {
            const newArticles = [...articles];
            newArticles[index] = {
              ...newArticles[index],
              disabled: request.disabled
            };
            return newArticles;
          }
          return articles;
        });
      }),
      catchError(error => {
        console.error('Disable article error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to disable article'));
      })
    );
  }

  getArticleCountByAuthor(userName: string): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/count/${userName}`).pipe(
      map(response => response.data.articles || 0),
      catchError(error => {
        console.error('Get article count error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to get article count'));
      })
    );
  }
}
