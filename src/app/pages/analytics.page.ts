import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SurveyService } from '../services/survey.service';
import { Survey, SurveyAnalytics } from '../models/survey.model';

@Component({
  selector: 'analytics-page',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.css']
})
export class AnalyticsPage implements OnInit, OnDestroy {
  searchForm: FormGroup;
  isLoading = false;
  isLoadingAnalytics = false;
  errorMessage = '';
  companyName = '';
  
  // Survey data
  surveys: Survey[] = [];
  selectedSurvey: Survey | null = null;
  surveyAnalytics: SurveyAnalytics | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService
  ) {
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.searchForm.valid && !this.isLoading) {
      const companyName = this.searchForm.get('companyName')?.value?.trim();
      if (companyName) {
        this.searchSurveysByCompany(companyName);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onSurveyRowClick(survey: Survey): void {
    if (this.selectedSurvey?.id === survey.id) {
      // Toggle off if clicking the same survey
      this.selectedSurvey = null;
      this.surveyAnalytics = null;
    } else {
      this.selectedSurvey = survey;
      this.loadSurveyAnalytics(survey.id);
    }
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
        return 'El nombre de la empresa es requerido';
      }
      if (field.errors['minlength']) {
        return 'El nombre debe tener al menos 2 caracteres';
      }
    }
    return '';
  }

  private createSearchForm(): FormGroup {
    return this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  private searchSurveysByCompany(companyName: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.companyName = companyName;
    this.selectedSurvey = null;
    this.surveyAnalytics = null;

    // Using search with company filter
    this.surveyService.searchSurveys('', { search: companyName })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (surveys) => {
          this.isLoading = false;
          this.surveys = surveys;
          if (surveys.length === 0) {
            this.errorMessage = `No se encontraron encuestas para la empresa "${companyName}"`;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error || 'Error al buscar encuestas de la empresa';
          this.surveys = [];
        }
      });
  }

  private loadSurveyAnalytics(surveyId: string): void {
    this.isLoadingAnalytics = true;
    
    this.surveyService.getSurveyAnalytics(surveyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analytics) => {
          this.isLoadingAnalytics = false;
          this.surveyAnalytics = analytics;
        },
        error: (error) => {
          this.isLoadingAnalytics = false;
          console.error('Error loading survey analytics:', error);
          // Still show the survey as selected, but without analytics
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.searchForm.controls).forEach(key => {
      const control = this.searchForm.get(key);
      control?.markAsTouched();
    });
  }

  // Utility methods for analytics display
  getCompletionPercentage(): number {
    if (!this.surveyAnalytics) return 0;
    return Math.round(this.surveyAnalytics.completionRate * 100);
  }

  getAverageTimeFormatted(): string {
    if (!this.surveyAnalytics) return '0 min';
    const minutes = Math.round(this.surveyAnalytics.averageTimeSpent / 60);
    return `${minutes} min`;
  }

  getQuestionResponseRate(questionAnalytics: any): number {
    if (!questionAnalytics.totalAnswers || !this.surveyAnalytics?.totalResponses) {
      return 0;
    }
    return Math.round((questionAnalytics.totalAnswers / this.surveyAnalytics.totalResponses) * 100);
  }
}