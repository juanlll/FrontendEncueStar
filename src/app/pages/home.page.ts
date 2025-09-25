import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SurveyService } from '../services/survey.service';
import { AuthService } from '../services/auth.service';
import { Survey } from '../models/survey.model';
import { User } from '../models/user.model';

@Component({
  selector: 'home-page',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css']
})
export class HomePage implements OnInit, OnDestroy {
  searchForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  currentUser: User | null = null;
  recentSurveys: Survey[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private authService: AuthService
  ) {
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadRecentSurveys();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.searchForm.valid && !this.isLoading) {
      const uuid = this.searchForm.get('uuid')?.value?.trim();
      if (uuid) {
        this.searchSurvey(uuid);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  navigateToCreator(): void {
    if (this.currentUser) {
      this.router.navigate(['/creator']);
    } else {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/creator' }
      });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToSurvey(survey: Survey): void {
    this.router.navigate(['/survey', survey.uuid]);
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.searchForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.searchForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'El UUID es requerido';
      }
      if (field.errors['pattern']) {
        return 'Formato de UUID inválido';
      }
      if (field.errors['minlength']) {
        return 'El UUID debe tener al menos 8 caracteres';
      }
    }
    return '';
  }

  private createSearchForm(): FormGroup {
    return this.fb.group({
      uuid: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^[a-fA-F0-9-]+$/)
      ]]
    });
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private loadRecentSurveys(): void {
    if (this.currentUser) {
      this.surveyService.getUserSurveys(this.currentUser.id, { page: 1, limit: 5 })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.recentSurveys = response.data;
          },
          error: (error) => {
            console.error('Error loading recent surveys:', error);
          }
        });
    }
  }

  private searchSurvey(uuid: string): void {
    this.isLoading = true;
    this.errorMessage = '';
     this.router.navigate(['/survey', uuid]);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.searchForm.controls).forEach(key => {
      const control = this.searchForm.get(key);
      control?.markAsTouched();
    });
  }
}
