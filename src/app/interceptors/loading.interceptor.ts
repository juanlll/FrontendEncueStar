import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

export interface LoadingState {
  loading: boolean;
  requestCount: number;
}

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private requestCount = 0;
  private loadingState: LoadingState = { loading: false, requestCount: 0 };

  // You can inject a loading service here to manage global loading state
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading for certain requests
    if (this.shouldSkipLoading(request)) {
      return next.handle(request);
    }

    this.incrementRequestCount();

    return next.handle(request).pipe(
      finalize(() => {
        this.decrementRequestCount();
      })
    );
  }

  private incrementRequestCount(): void {
    this.requestCount++;
    this.updateLoadingState();
  }

  private decrementRequestCount(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    this.updateLoadingState();
  }

  private updateLoadingState(): void {
    const isLoading = this.requestCount > 0;
    this.loadingState = {
      loading: isLoading,
      requestCount: this.requestCount
    };

    // Emit loading state to subscribers
    // You can implement a LoadingService to manage this globally
    console.log('Loading state:', this.loadingState);
  }

  private shouldSkipLoading(request: HttpRequest<any>): boolean {
    // Skip loading for certain endpoints (like auto-save operations)
    const skipEndpoints = [
      '/api/surveys/auto-save',
      '/api/analytics/track',
      '/api/health'
    ];

    return skipEndpoints.some(endpoint => request.url.includes(endpoint)) ||
           request.headers.has('X-Skip-Loading');
  }

  getLoadingState(): LoadingState {
    return { ...this.loadingState };
  }
}