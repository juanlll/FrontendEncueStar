import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  Question, 
  CreateQuestionDto, 
  UpdateQuestionDto,
  QuestionType
} from '../models/question.model';
import { ApiResponse } from '../models/base.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private readonly API_URL = `${environment.apiUrl}/questions`;
  private questionsSubject = new BehaviorSubject<Question[]>([]);
  public questions$ = this.questionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Question CRUD operations
  getQuestionsBySurvey(surveyId: string): Observable<Question[]> {
    const params = new HttpParams().set('surveyId', surveyId);
    return this.http.get<ApiResponse<Question[]>>(this.API_URL, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.sort((a, b) => a.order - b.order);
          }
          throw new Error(response.message || 'Failed to fetch questions');
        }),
        tap(questions => this.questionsSubject.next(questions)),
        catchError(this.handleError)
      );
  }

  getQuestionById(id: string): Observable<Question> {
    return this.http.get<ApiResponse<Question>>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch question');
        }),
        catchError(this.handleError)
      );
  }

  createQuestion(questionData: CreateQuestionDto): Observable<Question> {
    return this.http.post<ApiResponse<Question>>(this.API_URL, questionData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to create question');
        }),
        tap(question => this.addQuestionToList(question)),
        catchError(this.handleError)
      );
  }

  updateQuestion(id: string, questionData: UpdateQuestionDto): Observable<Question> {
    return this.http.put<ApiResponse<Question>>(`${this.API_URL}/${id}`, questionData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to update question');
        }),
        tap(question => this.updateQuestionInList(question)),
        catchError(this.handleError)
      );
  }

  deleteQuestion(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            return;
          }
          throw new Error(response.message || 'Failed to delete question');
        }),
        tap(() => this.removeQuestionFromList(id)),
        catchError(this.handleError)
      );
  }

  // Question ordering
  reorderQuestions(surveyId: string, questionIds: string[]): Observable<Question[]> {
    const payload = { surveyId, questionIds };
    return this.http.patch<ApiResponse<Question[]>>(`${this.API_URL}/reorder`, payload)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to reorder questions');
        }),
        tap(questions => this.questionsSubject.next(questions)),
        catchError(this.handleError)
      );
  }

  moveQuestion(questionId: string, newOrder: number): Observable<Question[]> {
    const payload = { questionId, newOrder };
    return this.http.patch<ApiResponse<Question[]>>(`${this.API_URL}/move`, payload)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to move question');
        }),
        tap(questions => this.questionsSubject.next(questions)),
        catchError(this.handleError)
      );
  }

  // Question duplication
  duplicateQuestion(id: string, surveyId?: string): Observable<Question> {
    const payload = surveyId ? { surveyId } : {};
    return this.http.post<ApiResponse<Question>>(`${this.API_URL}/${id}/duplicate`, payload)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to duplicate question');
        }),
        tap(question => this.addQuestionToList(question)),
        catchError(this.handleError)
      );
  }

  // Question validation
  validateQuestion(questionData: CreateQuestionDto | UpdateQuestionDto): Observable<{ isValid: boolean; errors: string[] }> {
    return this.http.post<ApiResponse<{ isValid: boolean; errors: string[] }>>(
      `${this.API_URL}/validate`, 
      questionData
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to validate question');
      }),
      catchError(this.handleError)
    );
  }

  // Question templates
  getQuestionTemplates(type?: QuestionType): Observable<Question[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<ApiResponse<Question[]>>(`${this.API_URL}/templates`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch question templates');
        }),
        catchError(this.handleError)
      );
  }

  createQuestionFromTemplate(templateId: string, surveyId: string, customizations?: Partial<CreateQuestionDto>): Observable<Question> {
    const payload = { templateId, surveyId, ...customizations };
    return this.http.post<ApiResponse<Question>>(`${this.API_URL}/from-template`, payload)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to create question from template');
        }),
        tap(question => this.addQuestionToList(question)),
        catchError(this.handleError)
      );
  }

  // Bulk operations
  createMultipleQuestions(questionsData: CreateQuestionDto[]): Observable<Question[]> {
    return this.http.post<ApiResponse<Question[]>>(`${this.API_URL}/bulk`, { questions: questionsData })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to create questions');
        }),
        tap(questions => {
          questions.forEach(question => this.addQuestionToList(question));
        }),
        catchError(this.handleError)
      );
  }

  updateMultipleQuestions(questionsData: UpdateQuestionDto[]): Observable<Question[]> {
    return this.http.put<ApiResponse<Question[]>>(`${this.API_URL}/bulk`, { questions: questionsData })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to update questions');
        }),
        tap(questions => {
          questions.forEach(question => this.updateQuestionInList(question));
        }),
        catchError(this.handleError)
      );
  }

  deleteMultipleQuestions(questionIds: string[]): Observable<void> {
    const params = new HttpParams().set('ids', questionIds.join(','));
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/bulk`, { params })
      .pipe(
        map(response => {
          if (response.success) {
            return;
          }
          throw new Error(response.message || 'Failed to delete questions');
        }),
        tap(() => {
          questionIds.forEach(id => this.removeQuestionFromList(id));
        }),
        catchError(this.handleError)
      );
  }

  // Import/Export questions
  exportQuestions(surveyId: string, format: 'json' | 'csv'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.API_URL}/export/${surveyId}`, {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  importQuestions(surveyId: string, file: File): Observable<Question[]> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('surveyId', surveyId);

    return this.http.post<ApiResponse<Question[]>>(`${this.API_URL}/import`, formData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to import questions');
        }),
        tap(questions => {
          questions.forEach(question => this.addQuestionToList(question));
        }),
        catchError(this.handleError)
      );
  }

  // Private helper methods
  private addQuestionToList(question: Question): void {
    const currentQuestions = this.questionsSubject.value;
    const newQuestions = [...currentQuestions, question].sort((a, b) => a.order - b.order);
    this.questionsSubject.next(newQuestions);
  }

  private updateQuestionInList(updatedQuestion: Question): void {
    const currentQuestions = this.questionsSubject.value;
    const index = currentQuestions.findIndex(question => question.id === updatedQuestion.id);
    
    if (index !== -1) {
      const newQuestions = [...currentQuestions];
      newQuestions[index] = updatedQuestion;
      this.questionsSubject.next(newQuestions.sort((a, b) => a.order - b.order));
    }
  }

  private removeQuestionFromList(questionId: string): void {
    const currentQuestions = this.questionsSubject.value;
    const filteredQuestions = currentQuestions.filter(question => question.id !== questionId);
    this.questionsSubject.next(filteredQuestions);
  }

  // Clear questions
  clearQuestions(): void {
    this.questionsSubject.next([]);
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

    console.error('QuestionService Error:', error);
    return throwError(errorMessage);
  };
}