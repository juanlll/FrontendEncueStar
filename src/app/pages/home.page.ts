import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'home-page',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css']
})
export class HomePage {
  uuid: string = '';

  constructor(private router: Router) {}

  goToSurvey() {
    if (this.uuid.trim()) {
      this.router.navigate(['/survey', this.uuid.trim()]);
    }
  }
}
