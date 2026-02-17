import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { CommentDto, CreateCommentRequest, UpdateCommentRequest, BlockCommentRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/comment';
  private commentsSignal = signal<CommentDto[]>([]);

  constructor() {}

  get comments() {
    return this.commentsSignal.asReadonly();
  }

  getCommentById(id: number): Observable<CommentDto | undefined> {
    return this.http.get<any>(this.apiUrl, {
      params: { id: id.toString() }
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Get comment error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch comment'));
      })
    );
  }

  getCommentsByArticle(articleId: number, page: number = 0, size: number = 100): Observable<CommentDto[]> {
    return this.http.get<any>(`${this.apiUrl}/comments`, {
      params: {
        objectId: articleId.toString(),
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      map(response => response.data.comments || response.data.content || response.data),
      tap(comments => this.commentsSignal.set(comments)),
      catchError(error => {
        console.error('Get comments by article error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch comments'));
      })
    );
  }

  createComment(request: CreateCommentRequest): Observable<CommentDto> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map(response => response.data),
      tap(comment => {
        this.commentsSignal.update(comments => [...comments, comment]);
      }),
      catchError(error => {
        console.error('Create comment error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to create comment'));
      })
    );
  }

  updateComment(request: UpdateCommentRequest): Observable<CommentDto> {
    return this.http.put<any>(this.apiUrl, request).pipe(
      map(response => response.data),
      tap(comment => {
        this.commentsSignal.update(comments => {
          const index = comments.findIndex(c => c.id === comment.id);
          if (index !== -1) {
            const newComments = [...comments];
            newComments[index] = comment;
            return newComments;
          }
          return comments;
        });
      }),
      catchError(error => {
        console.error('Update comment error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to update comment'));
      })
    );
  }

  blockComment(request: BlockCommentRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/disable/${request.id}`, null).pipe(
      tap(() => {
        this.commentsSignal.update(comments => {
          const index = comments.findIndex(c => c.id === request.id);
          if (index !== -1) {
            const newComments = [...comments];
            newComments[index] = {
              ...newComments[index],
              blocked: request.blocked
            };
            return newComments;
          }
          return comments;
        });
      }),
      catchError(error => {
        console.error('Block comment error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to block comment'));
      })
    );
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.commentsSignal.update(comments => comments.filter(c => c.id !== id));
      }),
      catchError(error => {
        console.error('Delete comment error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to delete comment'));
      })
    );
  }

  likeComment(id: number): Observable<CommentDto> {
    return this.http.patch<any>(`${this.apiUrl}/like`, null, {
      params: { id: id.toString() }
    }).pipe(
      map(response => response.data.comment),
      tap(updatedComment => {
        this.commentsSignal.update(comments => {
          const index = comments.findIndex(c => c.id === id);
          if (index !== -1) {
            const newComments = [...comments];
            newComments[index] = updatedComment;
            return newComments;
          }
          return comments;
        });
      }),
      catchError(error => {
        console.error('Like comment error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to like comment'));
      })
    );
  }
}
