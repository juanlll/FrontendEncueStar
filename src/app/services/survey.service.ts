import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  Survey, 
  CreateSurveyDto, 
  UpdateSurveyDto, 
  SurveyFilters,
  SurveyResponse,
  CreateSurveyResponseDto,
  SurveyAnalytics
} from '../models/survey.model';
import { ApiResponse, PaginationParams, PaginatedResponse } from '../models/base.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private readonly API_URL = `${environment.apiUrl}/surveys`;
  private surveysSubject = new BehaviorSubject<Survey[]>([]);
  private currentSurveySubject = new BehaviorSubject<Survey | null>(null);

  public surveys$ = this.surveysSubject.asObservable();
  public currentSurvey$ = this.currentSurveySubject.asObservable();

  constructor(private http: HttpClient) {}

  // Survey CRUD operations
  getSurveys(params?: PaginationParams, filters?: SurveyFilters): Observable<PaginatedResponse<Survey>> {
    let httpParams = new HttpParams();
    
    if (params) {
      httpParams = httpParams.set('page', params.page.toString());
      httpParams = httpParams.set('limit', params.limit.toString());
      
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            httpParams = httpParams.set(key, value.join(','));
          } else if (value instanceof Date) {
            httpParams = httpParams.set(key, value.toISOString());
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<Survey>>>(this.API_URL, { params: httpParams })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch surveys');
        }),
        tap(data => this.surveysSubject.next(data.data)),
        catchError(this.handleError)
      );
  }

  getSurveyById(id: string): Observable<Survey> {
    return this.http.get<ApiResponse<Survey>>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch survey');
        }),
        tap(survey => this.currentSurveySubject.next(survey)),
        catchError(this.handleError)
      );
  }

  getSurveyByUuid(uuid: string): Observable<Survey> {
    return this.http.get<ApiResponse<Survey>>(`${environment.apiUrl}/surveys/${uuid}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Survey not found');
        }),
        tap(survey => this.currentSurveySubject.next(survey)),
        catchError(this.handleError)
      );
  }

  createSurvey(surveyData: CreateSurveyDto): Observable<Survey> {
    return this.http.post<ApiResponse<Survey>>(this.API_URL, surveyData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to create survey');
        }),
        tap(survey => this.addSurveyToList(survey)),
        catchError(this.handleError)
      );
  }

  updateSurvey(id: string, surveyData: UpdateSurveyDto): Observable<Survey> {
    return this.http.put<ApiResponse<Survey>>(`${this.API_URL}/${id}`, surveyData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to update survey');
        }),
        tap(survey => {
          this.updateSurveyInList(survey);
          this.currentSurveySubject.next(survey);
        }),
        catchError(this.handleError)
      );
  }

  deleteSurvey(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            return;
          }
          throw new Error(response.message || 'Failed to delete survey');
        }),
        tap(() => this.removeSurveyFromList(id)),
        catchError(this.handleError)
      );
  }

  // Survey publishing and status management
  publishSurvey(id: string): Observable<Survey> {
    return this.http.patch<ApiResponse<Survey>>(`${this.API_URL}/${id}/publish`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to publish survey');
        }),
        tap(survey => this.updateSurveyInList(survey)),
        catchError(this.handleError)
      );
  }

  unpublishSurvey(id: string): Observable<Survey> {
    return this.http.patch<ApiResponse<Survey>>(`${this.API_URL}/${id}/unpublish`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to unpublish survey');
        }),
        tap(survey => this.updateSurveyInList(survey)),
        catchError(this.handleError)
      );
  }

  duplicateSurvey(id: string, newTitle?: string): Observable<Survey> {
    const payload = newTitle ? { title: newTitle } : {};
    return this.http.post<ApiResponse<Survey>>(`${this.API_URL}/${id}/duplicate`, payload)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to duplicate survey');
        }),
        tap(survey => this.addSurveyToList(survey)),
        catchError(this.handleError)
      );
  }

  // Survey responses
  getSurveyResponses(surveyId: string, params?: PaginationParams): Observable<PaginatedResponse<SurveyResponse>> {
    let httpParams = new HttpParams();
    
    if (params) {
      httpParams = httpParams.set('page', params.page.toString());
      httpParams = httpParams.set('limit', params.limit.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get<ApiResponse<PaginatedResponse<SurveyResponse>>>(
      `${this.API_URL}/${surveyId}/responses`, 
      { params: httpParams }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch survey responses');
      }),
      catchError(this.handleError)
    );
  }

  submitSurveyResponse(responseData: CreateSurveyResponseDto): Observable<SurveyResponse> {
    return this.http.post<ApiResponse<SurveyResponse>>(
      `${this.API_URL}/${responseData.surveyId}/responses`, 
      responseData
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to submit survey response');
      }),
      catchError(this.handleError)
    );
  }

  // Survey analytics
  getSurveyAnalytics(surveyId: string): Observable<SurveyAnalytics> {
    return this.http.get<ApiResponse<SurveyAnalytics>>(`${this.API_URL}/${surveyId}/analytics`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch survey analytics');
        }),
        catchError(this.handleError)
      );
  }

  // Export functionality
  exportSurveyData(surveyId: string, format: 'csv' | 'excel' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${surveyId}/export/${format}`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Survey search and filtering
  searchSurveys(query: string, filters?: SurveyFilters): Observable<Survey[]> {
    let params = new HttpParams().set('search', query);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            params = params.set(key, value.join(','));
          } else if (value instanceof Date) {
            params = params.set(key, value.toISOString());
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<ApiResponse<Survey[]>>(`${this.API_URL}/search`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to search surveys');
        }),
        catchError(this.handleError)
      );
  }

  // User's surveys
  getUserSurveys(userId: string, params?: PaginationParams): Observable<PaginatedResponse<Survey>> {
    let httpParams = new HttpParams();
    
    if (params) {
      httpParams = httpParams.set('page', params.page.toString());
      httpParams = httpParams.set('limit', params.limit.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get<ApiResponse<PaginatedResponse<Survey>>>(
      `${this.API_URL}/user/${userId}`, 
      { params: httpParams }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch user surveys');
      }),
      catchError(this.handleError)
    );
  }

  // Survey validation
  validateSurvey(surveyData: CreateSurveyDto | UpdateSurveyDto): Observable<{ isValid: boolean; errors: string[] }> {
    return this.http.post<ApiResponse<{ isValid: boolean; errors: string[] }>>(
      `${this.API_URL}/validate`, 
      surveyData
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to validate survey');
      }),
      catchError(this.handleError)
    );
  }

  // Private helper methods
  private addSurveyToList(survey: Survey): void {
    const currentSurveys = this.surveysSubject.value;
    this.surveysSubject.next([survey, ...currentSurveys]);
  }

  private updateSurveyInList(updatedSurvey: Survey): void {
    const currentSurveys = this.surveysSubject.value;
    const index = currentSurveys.findIndex(survey => survey.id === updatedSurvey.id);
    
    if (index !== -1) {
      const newSurveys = [...currentSurveys];
      newSurveys[index] = updatedSurvey;
      this.surveysSubject.next(newSurveys);
    }
  }

  private removeSurveyFromList(surveyId: string): void {
    const currentSurveys = this.surveysSubject.value;
    const filteredSurveys = currentSurveys.filter(survey => survey.id !== surveyId);
    this.surveysSubject.next(filteredSurveys);
  }

  // Clear current survey
  clearCurrentSurvey(): void {
    this.currentSurveySubject.next(null);
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

    console.error('SurveyService Error:', error);
    return throwError(errorMessage);
  };
}