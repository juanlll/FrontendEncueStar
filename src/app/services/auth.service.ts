import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  User, 
  LoginDto, 
  LoginResponse, 
  CreateUserDto, 
  UpdateUserDto, 
  ChangePasswordDto 
} from '../models/user.model';
import { ApiResponse } from '../models/base.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  // Authentication methods
  login(credentials: LoginDto): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/login`, credentials)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.setAuthData(response.data);
            return response.data;
          }
          throw new Error(response.message || 'Login failed');
        }),
        catchError(this.handleError)
      );
  }

  register(userData: CreateUserDto): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.API_URL}/register`, userData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Registration failed');
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/logout`, {})
      .pipe(
        tap(() => this.clearAuthData()),
        map(() => void 0),
        catchError(() => {
          // Even if logout fails on server, clear local data
          this.clearAuthData();
          return [];
        })
      );
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError('No refresh token available');
    }

    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/refresh`, { 
      refreshToken 
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data);
          return response.data;
        }
        throw new Error(response.message || 'Token refresh failed');
      }),
      catchError(error => {
        this.clearAuthData();
        return throwError(error);
      })
    );
  }

  changePassword(passwordData: ChangePasswordDto): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/change-password`, passwordData)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Password change failed');
          }
        }),
        catchError(this.handleError)
      );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/forgot-password`, { email })
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Password reset request failed');
          }
        }),
        catchError(this.handleError)
      );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/reset-password`, { 
      token, 
      newPassword 
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Password reset failed');
        }
      }),
      catchError(this.handleError)
    );
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value || localStorage.getItem('auth_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  // Private methods
  private setAuthData(authData: LoginResponse): void {
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('refresh_token', authData.refreshToken);
    localStorage.setItem('user_data', JSON.stringify(authData.user));
    
    this.currentUserSubject.next(authData.user);
    this.tokenSubject.next(authData.token);
  }

  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData && !this.isTokenExpired(token)) {
      try {
        const user = JSON.parse(userData) as User;
        this.currentUserSubject.next(user);
        this.tokenSubject.next(token);
      } catch (error) {
        this.clearAuthData();
      }
    } else {
      this.clearAuthData();
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch (error) {
      return true;
    }
  }

  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error('AuthService Error:', error);
    return throwError(errorMessage);
  };
}