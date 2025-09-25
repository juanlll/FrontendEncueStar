import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  User, 
  UpdateUserDto, 
  UserPreferences 
} from '../models/user.model';
import { ApiResponse, PaginationParams, PaginatedResponse } from '../models/base.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // User CRUD operations
  getUsers(params?: PaginationParams): Observable<PaginatedResponse<User>> {
    let httpParams = new HttpParams();
    
    if (params) {
      httpParams = httpParams.set('page', params.page.toString());
      httpParams = httpParams.set('limit', params.limit.toString());
      
      if (params.sortBy) {
        httpParams = httpParams.set('sortBy', params.sortBy);
      }
      if (params.sortOrder) {
        httpParams = httpParams.set('sortOrder', params.sortOrder);
      }
    }

    return this.http.get<ApiResponse<PaginatedResponse<User>>>(this.API_URL, { params: httpParams })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch users');
        }),
        catchError(this.handleError)
      );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch user');
        }),
        catchError(this.handleError)
      );
  }

  getUserByEmail(email: string): Observable<User> {
    const params = new HttpParams().set('email', email);
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/by-email`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch user');
        }),
        catchError(this.handleError)
      );
  }

  updateUser(id: string, userData: UpdateUserDto): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/${id}`, userData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.updateUserInList(response.data);
            return response.data;
          }
          throw new Error(response.message || 'Failed to update user');
        }),
        catchError(this.handleError)
      );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            this.removeUserFromList(id);
            return;
          }
          throw new Error(response.message || 'Failed to delete user');
        }),
        catchError(this.handleError)
      );
  }

  // User preferences
  getUserPreferences(userId: string): Observable<UserPreferences> {
    return this.http.get<ApiResponse<UserPreferences>>(`${this.API_URL}/${userId}/preferences`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch user preferences');
        }),
        catchError(this.handleError)
      );
  }

  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http.put<ApiResponse<UserPreferences>>(`${this.API_URL}/${userId}/preferences`, preferences)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to update user preferences');
        }),
        catchError(this.handleError)
      );
  }

  // User avatar/profile image
  uploadProfileImage(userId: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<ApiResponse<{ imageUrl: string }>>(`${this.API_URL}/${userId}/upload-image`, formData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.imageUrl;
          }
          throw new Error(response.message || 'Failed to upload image');
        }),
        catchError(this.handleError)
      );
  }

  // User search and filtering
  searchUsers(query: string, filters?: any): Observable<User[]> {
    let params = new HttpParams().set('search', query);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<ApiResponse<User[]>>(`${this.API_URL}/search`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to search users');
        }),
        catchError(this.handleError)
      );
  }

  // User activation/deactivation
  activateUser(id: string): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${this.API_URL}/${id}/activate`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.updateUserInList(response.data);
            return response.data;
          }
          throw new Error(response.message || 'Failed to activate user');
        }),
        catchError(this.handleError)
      );
  }

  deactivateUser(id: string): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${this.API_URL}/${id}/deactivate`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.updateUserInList(response.data);
            return response.data;
          }
          throw new Error(response.message || 'Failed to deactivate user');
        }),
        catchError(this.handleError)
      );
  }

  // Private helper methods
  private updateUserInList(updatedUser: User): void {
    const currentUsers = this.usersSubject.value;
    const index = currentUsers.findIndex(user => user.id === updatedUser.id);
    
    if (index !== -1) {
      const newUsers = [...currentUsers];
      newUsers[index] = updatedUser;
      this.usersSubject.next(newUsers);
    }
  }

  private removeUserFromList(userId: string): void {
    const currentUsers = this.usersSubject.value;
    const filteredUsers = currentUsers.filter(user => user.id !== userId);
    this.usersSubject.next(filteredUsers);
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

    console.error('UserService Error:', error);
    return throwError(errorMessage);
  };
}