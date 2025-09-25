import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomePage } from "./pages/home.page";
import { SurveyPage } from "./pages/survey.page";
import { CreatorPage } from "./pages/creator.page";
import { LoginComponent } from "./auth/login.component";
import { RegisterComponent } from "./auth/register.component";

const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'survey/:uuid', component: SurveyPage }, // <-- Ruta con parámetro
  { path: 'creator', component: CreatorPage },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' } // Redirección para rutas no encontradas
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
