import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error, request, next);
      })
    );
  }

  private handleError(
    error: HttpErrorResponse, 
    request: HttpRequest<any>, 
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    switch (error.status) {
      case 401:
        return this.handle401Error(request, next);
      case 403:
        return this.handle403Error();
      case 404:
        return this.handle404Error(error);
      case 500:
        return this.handle500Error(error);
      default:
        return this.handleGenericError(error);
    }
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Try to refresh token
    if (this.authService.getRefreshToken() && !request.url.includes('/auth/refresh')) {
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          // Retry original request with new token
          const token = this.authService.getToken();
          const authRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(authRequest);
        }),
        catchError((refreshError) => {
          // Refresh failed, redirect to login
          this.authService.logout().subscribe();
          this.router.navigate(['/login']);
          return throwError('Session expired. Please login again.');
        })
      );
    } else {
      // No refresh token or refresh endpoint, redirect to login
      this.authService.logout().subscribe();
      this.router.navigate(['/login']);
      return throwError('Authentication required. Please login.');
    }
  }

  private handle403Error(): Observable<never> {
    // Forbidden - user doesn't have permission
    console.error('Access forbidden - insufficient permissions');
    return throwError('No tienes permisos para realizar esta acción.');
  }

  private handle404Error(error: HttpErrorResponse): Observable<never> {
    console.error('Resource not found:', error.url);
    return throwError('El recurso solicitado no fue encontrado.');
  }

  private handle500Error(error: HttpErrorResponse): Observable<never> {
    console.error('Server error:', error);
    return throwError('Error interno del servidor. Intenta nuevamente más tarde.');
  }

  private handleGenericError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('HTTP Error:', {
      status: error.status,
      message: errorMessage,
      url: error.url
    });

    return throwError(errorMessage);
  }
}