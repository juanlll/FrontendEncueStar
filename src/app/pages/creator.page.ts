import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SurveyService } from '../services/survey.service';
import { AuthService } from '../services/auth.service';
import { Survey, CreateSurveyDto } from '../models/survey.model';
import { User } from '../models/user.model';

@Component({
  selector: 'creator-page',
  templateUrl: './creator.page.html'
})
export class CreatorPage implements OnInit, OnDestroy {
  currentUser: User | null = null;
  currentSurvey: Survey | null = null;
  isLoading = false;
  isNewSurvey = true;
  surveyId: string | null = null;
  
  // Survey creator configuration
  creatorOptions = {
    showLogicTab: true,
    showTranslationTab: false,
    showEmbededSurveyTab: false,
    showJSONEditorTab: true,
    showTestSurveyTab: true,
    showToolbox: true,
    showPropertyGrid: true,
    allowModifyPages: true,
    questionTypes: [
      'text', 'comment', 'checkbox', 'radiogroup', 
      'dropdown', 'rating', 'boolean', 'date', 
      'email', 'number'
    ]
  };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private surveyService: SurveyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadSurveyId();
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSurveyCreated(surveyJSON: any): void {
    if (this.isNewSurvey) {
      this.createNewSurvey(surveyJSON);
    } else {
      this.updateExistingSurvey(surveyJSON);
    }
  }

  onSurveyPreview(): void {
    if (this.currentSurvey) {
      // Open preview in new tab/window
      const previewUrl = `/survey/${this.currentSurvey.uuid}?preview=true`;
      window.open(previewUrl, '_blank');
    }
  }

  onSurveyPublish(): void {
    if (this.currentSurvey && !this.isLoading) {
      this.isLoading = true;
      
      this.surveyService.publishSurvey(this.currentSurvey.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (survey) => {
            this.isLoading = false;
            this.currentSurvey = survey;
            // Show success message or redirect
            this.router.navigate(['/survey', survey.uuid]);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error publishing survey:', error);
            // Show error message
          }
        });
    }
  }

  onSurveySave(surveyJSON: any): void {
    // Auto-save functionality
    if (this.currentSurvey) {
      this.updateExistingSurvey(surveyJSON, false); // Silent save
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToMySurveys(): void {
    this.router.navigate(['/my-surveys']);
  }

  private checkAuthentication(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
    }
  }

  private loadSurveyId(): void {
    this.surveyId = this.route.snapshot.paramMap.get('id');
    this.isNewSurvey = !this.surveyId;
    
    if (this.surveyId) {
      this.loadExistingSurvey(this.surveyId);
    }
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private loadExistingSurvey(surveyId: string): void {
    this.isLoading = true;
    
    this.surveyService.getSurveyById(surveyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (survey) => {
          this.isLoading = false;
          this.currentSurvey = survey;
          
          // Check if current user is the owner
          if (this.currentUser && survey.creatorId !== this.currentUser.id) {
            // Redirect to unauthorized page or show error
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading survey:', error);
          this.router.navigate(['/']);
        }
      });
  }

  private createNewSurvey(surveyJSON: any, showSuccess = true): void {
    if (!this.currentUser) return;

    this.isLoading = true;

    const surveyData: CreateSurveyDto = {
      title: surveyJSON.title || 'Nueva Encuesta',
      description: surveyJSON.description || 'Descripción de la encuesta',
      isPublic: false,
      allowAnonymous: true,
      theme: {
        primaryColor: '#19b394',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: 14
      },
      language: 'es'
    };

    this.surveyService.createSurvey(surveyData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (survey) => {
          this.isLoading = false;
          this.currentSurvey = survey;
          this.isNewSurvey = false;
          
          if (showSuccess) {
            // Show success message
            console.log('Survey created successfully');
          }
          
          // Update URL to reflect the new survey ID
          this.router.navigate(['/creator', survey.id], { replaceUrl: true });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error creating survey:', error);
          // Show error message
        }
      });
  }

  private updateExistingSurvey(surveyJSON: any, showSuccess = true): void {
    if (!this.currentSurvey) return;

    this.isLoading = true;

    const updateData = {
      id: this.currentSurvey.id,
      title: surveyJSON.title || this.currentSurvey.title,
      description: surveyJSON.description || this.currentSurvey.description
    };

    this.surveyService.updateSurvey(this.currentSurvey.id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (survey) => {
          this.isLoading = false;
          this.currentSurvey = survey;
          
          if (showSuccess) {
            // Show success message
            console.log('Survey updated successfully');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error updating survey:', error);
          // Show error message
        }
      });
  }
}
