import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "environments/environment";

interface SurveyApiResponse {
  enterpriseName: string;
  bodySurvey: any;
  titleSurvey: string;
  descriptionSurvey: string;
  id?: string;
}

@Component({
  selector: "survey-page",
  templateUrl: "./survey.page.html",
})
export class SurveyPage implements OnInit {
  json: any = null;
  uuid = '';
  loading = true;
  error = '';
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const paramUuid = params.get('uuid');
      if (!paramUuid) {
        this.setError('No se proporcionó UUID de encuesta.');
        return;
      }
      this.uuid = paramUuid;
      this.loadSurvey();
    });
  }

  private loadSurvey(): void {
    this.startLoading();
    const apiUrl = `${environment.apiUrl}/${this.uuid}`;
    this.http.get<SurveyApiResponse>(apiUrl).subscribe({
      next: data => this.handleSurveyData(data),
      error: () => this.setError('No se pudo cargar la encuesta.')
    });
  }

  private handleSurveyData(data: SurveyApiResponse): void {
    if (!data || !data.bodySurvey) {
      this.setError('Encuesta no encontrada o datos inválidos.');
      return;
    }
    this.json = { ...data.bodySurvey, title: `${data.bodySurvey.title} - ${data.enterpriseName}` };
    this.finishLoading();
  }

  private setError(message: string): void {
    this.loading = false;
    this.error = message;
    this.json = null;
  }

  private startLoading(): void {
    this.loading = true;
    this.error = '';
    this.json = null;
  }

  private finishLoading(): void {
    setTimeout(() => (this.loading = false), 500);
  }

  sendData(result: any): void {
    // Enviar respuestas a la API
    const payload = {
      survey_id: this.uuid,
      answers: result
    };
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post(`${environment.apiUrl}/answers`, payload).subscribe({
      next: () => {
        this.successMessage = '¡Encuesta diligenciada correctamente!';
      },
      error: () => {
        this.errorMessage = 'Error al guardar la respuesta. Intenta de nuevo.';
      }
    });
  }
}
