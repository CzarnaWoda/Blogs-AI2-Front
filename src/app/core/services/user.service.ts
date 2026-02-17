import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { UserDto, UpdateUserRequest } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/user';
  private usersSignal = signal<UserDto[]>([]);

  constructor(private authService: AuthService) {}

  get users() {
    return this.usersSignal.asReadonly();
  }

  getUsers(page: number = 0, size: number = 100): Observable<UserDto[]> {
    return this.http.get<any>(`${this.apiUrl}/users`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      map(response => response.data.users || response.data.content || response.data),
      tap(users => this.usersSignal.set(users)),
      catchError(error => {
        console.error('Get users error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch users'));
      })
    );
  }

  getUsersByEmail(email: string, page: number = 0, size: number = 100): Observable<{ users: UserDto[], totalElements: number, totalPages: number }> {
    return this.http.get<any>(`${this.apiUrl}/users/email`, {
      params: {
        email,
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      map(response => ({
        users: response.data.users || [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0
      })),
      catchError(error => {
        console.error('Get users by email error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch users by email'));
      })
    );
  }

  getUsersByRole(role: string, page: number = 0, size: number = 100): Observable<{ users: UserDto[], totalElements: number, totalPages: number }> {
    return this.http.get<any>(`${this.apiUrl}/users/role`, {
      params: {
        role,
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      map(response => ({
        users: response.data.users || [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0
      })),
      catchError(error => {
        console.error('Get users by role error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch users by role'));
      })
    );
  }

  getUsersByEmailAndRole(email: string, role: string, page: number = 0, size: number = 100): Observable<{ users: UserDto[], totalElements: number, totalPages: number }> {
    return this.http.get<any>(`${this.apiUrl}/users/email-role`, {
      params: {
        email,
        role,
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      map(response => ({
        users: response.data.users || [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0
      })),
      catchError(error => {
        console.error('Get users by email and role error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch users by email and role'));
      })
    );
  }

  getUserByEmail(email: string): Observable<UserDto | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${email}`).pipe(
      map(response => response.data.user || response.data),
      catchError(error => {
        console.error('Get user error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch user'));
      })
    );
  }

  getUserByUserName(userName: string): Observable<UserDto | undefined> {
    return this.http.get<any>(`${this.apiUrl}/userName/${userName}`).pipe(
      map(response => response.data.user || response.data),
      catchError(error => {
        console.error('Get user by username error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch user'));
      })
    );
  }

  updateUser(request: UpdateUserRequest): Observable<UserDto> {
    return this.http.put<any>(this.apiUrl, request).pipe(
      map(response => response.data.user || response.data),
      tap(user => {
        // Update in local signal
        this.usersSignal.update(users => {
          const index = users.findIndex(u => u.email === user.email);
          if (index !== -1) {
            const newUsers = [...users];
            newUsers[index] = user;
            return newUsers;
          }
          return users;
        });

        // Update current user in localStorage if it's the same user
        const currentUser = this.authService.currentUser();
        if (currentUser && currentUser.email === user.email) {
          localStorage.setItem('current_user', JSON.stringify(user));
        }
      }),
      catchError(error => {
        console.error('Update user error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to update user'));
      })
    );
  }

  addRole(username: string, role: string): Observable<UserDto> {
    return this.http.patch<any>(`${this.apiUrl}/role/add`, {
      username,
      role
    }).pipe(
      map(response => response.data.user || response.data),
      tap(user => {
        this.usersSignal.update(users => {
          const index = users.findIndex(u => u.userName === username);
          if (index !== -1) {
            const newUsers = [...users];
            newUsers[index] = user;
            return newUsers;
          }
          return users;
        });
      }),
      catchError(error => {
        console.error('Add role error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to add role'));
      })
    );
  }

  removeRole(username: string, role: string): Observable<UserDto> {
    return this.http.patch<any>(`${this.apiUrl}/role/remove`, {
      username,
      role
    }).pipe(
      map(response => response.data.user || response.data),
      tap(user => {
        this.usersSignal.update(users => {
          const index = users.findIndex(u => u.userName === username);
          if (index !== -1) {
            const newUsers = [...users];
            newUsers[index] = user;
            return newUsers;
          }
          return users;
        });
      }),
      catchError(error => {
        console.error('Remove role error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to remove role'));
      })
    );
  }

  deleteUser(email: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${email}`).pipe(
      tap(() => {
        this.usersSignal.update(users => users.filter(u => u.email !== email));
      }),
      catchError(error => {
        console.error('Delete user error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to delete user'));
      })
    );
  }
}
