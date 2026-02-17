import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { SectionDto, CreateSectionRequest, UpdateSectionRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/section';
  private sectionsSignal = signal<SectionDto[]>([]);

  constructor() {
    this.loadSections();
  }

  private loadSections(): void {
    this.getSections().subscribe({
      next: (response) => this.sectionsSignal.set(response.sections),
      error: (err) => console.error('Failed to load sections:', err)
    });
  }

  get sections() {
    return this.sectionsSignal.asReadonly();
  }

  getSections(page: number = 0, size: number = 100): Observable<{ sections: SectionDto[], totalElements: number, totalPages: number }> {
    return this.http.get<any>(`${this.apiUrl}/sections`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      map(response => ({
        sections: response.data.sections || response.data.content || response.data || [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0
      })),
      tap(data => this.sectionsSignal.set(data.sections)),
      catchError(error => {
        console.error('Get sections error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch sections'));
      })
    );
  }

  getSectionById(id: number): Observable<SectionDto | undefined> {
    return this.http.get<any>(`${this.apiUrl}/section/id/${id}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Get section error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch section'));
      })
    );
  }

  getSectionByTitle(title: string): Observable<SectionDto | undefined> {
    return this.http.get<any>(`${this.apiUrl}/section/title/${title}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Get section by title error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch section'));
      })
    );
  }

  getSectionsByType(type: string): Observable<SectionDto[]> {
    return this.http.get<any>(`${this.apiUrl}/sections/title/${type}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Get sections by type error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch sections'));
      })
    );
  }

  createSection(request: CreateSectionRequest): Observable<SectionDto> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map(response => response.data),
      tap(section => {
        this.sectionsSignal.update(sections => [...sections, section]);
      }),
      catchError(error => {
        console.error('Create section error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to create section'));
      })
    );
  }

  updateSection(request: UpdateSectionRequest): Observable<SectionDto> {
    return this.http.put<any>(this.apiUrl, request).pipe(
      map(response => response.data),
      tap(section => {
        this.sectionsSignal.update(sections => {
          const index = sections.findIndex(s => s.id === section.id);
          if (index !== -1) {
            const newSections = [...sections];
            newSections[index] = section;
            return newSections;
          }
          return sections;
        });
      }),
      catchError(error => {
        console.error('Update section error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to update section'));
      })
    );
  }

  deleteSection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.sectionsSignal.update(sections => sections.filter(s => s.id !== id));
      }),
      catchError(error => {
        console.error('Delete section error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to delete section'));
      })
    );
  }

  incrementViews(id: number): void {
    this.sectionsSignal.update(sections => {
      const index = sections.findIndex(s => s.id === id);
      if (index !== -1) {
        const newSections = [...sections];
        newSections[index] = {
          ...newSections[index],
          views: newSections[index].views + 1
        };
        return newSections;
      }
      return sections;
    });
  }
}
