import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

type QuestionType = 'checkbox' | 'text' | 'comment';

interface Question {
  type: QuestionType;
  title: string;
  name: string;
  choices?: string[];
}

interface Survey {
  title: string;
  description: string;
  questions: Question[];
  enterpriseName: string;
}

@Component({
  selector: 'app-survey-creator',
  templateUrl: './survey-creator.component.html',
  styleUrls: ['./survey-creator.component.css']
})
export class SurveyCreatorComponent {
  survey: Survey = this.initSurvey();
  newQuestion: Question = this.initQuestion();
  showChoicesInput = true;
  newOption = '';
  loading = false;

  toastMessage = '';
  toastType: 'success' | 'error' | '' = '';
  showToast = false;
  createdSurveyId: string | null = null;

  constructor(private http: HttpClient) {}

  private initSurvey(): Survey {
    return {
      title: '',
      description: '',
      questions: [],
      enterpriseName: ''
    };
  }

  private initQuestion(): Question {
    return {
      type: 'checkbox',
      title: '',
      name: '',
      choices: []
    };
  }

  get isSurveyValid(): boolean {
    return (
      this.survey.title.trim().length > 0 &&
      this.survey.description.trim().length > 0 &&
      this.survey.enterpriseName.trim().length > 0 &&
      this.survey.questions.length > 0
    );
  }

  get isQuestionValid(): boolean {
    return (
      this.newQuestion.type !== undefined &&
      this.newQuestion.title.trim().length > 0 &&
      this.newQuestion.name.trim().length > 0 &&
      (this.newQuestion.type !== 'checkbox' || (this.newQuestion.choices && this.newQuestion.choices.length > 0))
    );
  }

  onTypeChange(): void {
    this.showChoicesInput = this.newQuestion.type === 'checkbox';
    if (!this.showChoicesInput) this.newQuestion.choices = [];
  }

  addChoice(): void {
    const option = this.newOption.trim();
    if (!option) return;
    this.newQuestion.choices = this.newQuestion.choices || [];
    this.newQuestion.choices.push(option);
    this.newOption = '';
  }

  removeChoice(idx: number): void {
    if (!this.newQuestion.choices) return;
    this.newQuestion.choices.splice(idx, 1);
  }

  addQuestion(): void {
    if (!this.isQuestionValid) {
      this.showToastMessage('Completa todos los campos de la pregunta.', 'error');
      return;
    }
    const question: Question = {
      type: this.newQuestion.type,
      title: this.newQuestion.title,
      name: this.newQuestion.name,
      choices: this.newQuestion.type === 'checkbox' ? [...(this.newQuestion.choices || [])] : undefined
    };
    this.survey.questions.push(question);
    this.newQuestion = this.initQuestion();
    this.showChoicesInput = true;
    this.newOption = '';
  }

  removeQuestion(idx: number): void {
    this.survey.questions.splice(idx, 1);
  }

  saveSurvey(): void {
    if (!this.isSurveyValid) {
      this.showToastMessage('Completa todos los campos principales y agrega al menos una pregunta.', 'error');
      return;
    }
    this.setLoading(true);
    const payload = this.buildSurveyPayload();

    this.http.post(environment.apiUrl, payload).subscribe({
      next: (response: any) => this.handleSuccess(response),
      error: () => this.handleError()
    });
  }

  private buildSurveyPayload() {
    return {
      enterpriseName: this.survey.enterpriseName,
      bodySurvey: {
        title: this.survey.title,
        description: this.survey.description,
        pages: [
          {
            name: "page1",
            elements: this.survey.questions.map(q => ({
              type: q.type,
              name: q.name,
              title: q.title,
              ...(q.type === 'checkbox' ? { choices: q.choices || [] } : {})
            }))
          }
        ]
      },
      titleSurvey: this.survey.title,
      descriptionSurvey: this.survey.description
    };
  }

  private setLoading(isLoading: boolean): void {
    this.loading = isLoading;
  }

  private handleSuccess(response: any): void {
    this.survey = this.initSurvey();
    this.createdSurveyId = response.id;
    this.showToastMessage('¡Encuesta guardada exitosamente!', 'success');
    this.loading = false;
  }

  private handleError(): void {
    this.showToastMessage('Error al guardar la encuesta.', 'error');
    this.loading = false;
  }

  private showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
      this.toastMessage = '';
      this.toastType = '';
    }, 3500);
  }
}
