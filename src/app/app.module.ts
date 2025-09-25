import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app.routing.module";
import { AppComponent } from "./app.component";
import { SurveyComponent } from "./components/survey.component";
import { HomePage } from "./pages/home.page";
import { SurveyPage } from "./pages/survey.page";
import { CreatorPage } from "./pages/creator.page";
import { AnalyticsPage } from "./pages/analytics.page";
import { SurveyAnalyticsComponent } from "./components/survey.analytics.component";
import { SurveyAnalyticsTabulatorComponent } from "./components/survey.analytics.tabulator";
import { SurveyModule } from "survey-angular-ui";
import { SurveyCreatorModule } from "survey-creator-angular";
import { LoginComponent } from "./auth/login.component";
import { RegisterComponent } from "./auth/register.component";
import { AuthService } from "./auth/auth.service";
import { SurveyCreatorComponent } from "./components/survey-creator/survey-creator.component";

@NgModule({
  declarations: [
    AppComponent,
    HomePage,
    SurveyComponent,
    SurveyPage,
    SurveyCreatorComponent,
    CreatorPage,
    AnalyticsPage,
    SurveyAnalyticsComponent,
    SurveyAnalyticsTabulatorComponent,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    ReactiveFormsModule, FormsModule,BrowserModule, HttpClientModule, AppRoutingModule, SurveyModule, SurveyCreatorModule],
  providers: [AuthService],
  bootstrap: [AppComponent],
})
export class AppModule {}
