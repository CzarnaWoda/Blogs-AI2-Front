import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { LoginRequest, LoginResponse, UserDto, UserRole, ChangePasswordRequest } from '../models';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  countryCode: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/auth';
  private currentUserSignal = signal<UserDto | null>(null);
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  constructor() {
    this.loadUserFromStorage();
  }

  get currentUser() {
    return this.currentUserSignal.asReadonly();
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      email: request.email,
      password: request.password,
      remember: true
    }).pipe(
      map(response => {
        // Backend returns: { data: { token: string, user: UserDto } }
        return {
          token: response.data.token,
          user: response.data.user
        };
      }),
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.currentUserSignal.set(res.user);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error(error.error?.message || 'Invalid credentials'));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSignal();
    return user?.userRoles.includes(role) ?? false;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserSignal();
    return roles.some(role => user?.userRoles.includes(role)) ?? false;
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, {
      username: request.username,
      email: request.email,
      password: request.password,
      countryCode: request.countryCode,
      phone: request.phone
    }).pipe(
      map(response => {
        // Backend returns: { data: { user: UserDto } }
        return response.data;
      }),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => new Error(error.error?.message || 'Registration failed'));
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<any>(`${this.apiUrl}/changePassword`, {
      oldPassword: request.oldPassword,
      newPassword: request.newPassword
    }).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Change password error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to change password'));
      })
    );
  }

  getMe(): Observable<UserDto> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map(response => response.data.user || response.data),
      tap(user => {
        this.currentUserSignal.set(user);
        localStorage.setItem(this.userKey, JSON.stringify(user));
      }),
      catchError(error => {
        console.error('Get me error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch user data'));
      })
    );
  }

  getAuthorities(): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/authorities`).pipe(
      map(response => response.data.authorities.map((auth: any) => auth.value)),
      catchError(error => {
        console.error('Get authorities error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch authorities'));
      })
    );
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem(this.userKey);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as UserDto;
        this.currentUserSignal.set(user);
      } catch {
        this.logout();
      }
    }
  }
}
