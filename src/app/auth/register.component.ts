import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  errorMsg = '';
  successMsg = '';
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  onSubmit() {
    const { username, password } = this.form.value;
    if (!username || !password) return;
    if (this.auth.register(username, password)) {
      this.successMsg = 'Registro exitoso. Puedes iniciar sesión.';
      this.errorMsg = '';
    } else {
      this.errorMsg = 'El usuario ya existe';
      this.successMsg = '';
    }
  }
}
