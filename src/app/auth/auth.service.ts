// This file is deprecated. Please use the new AuthService in services/auth.service.ts
// This old service is kept for backward compatibility but should be replaced.

import { Injectable } from '@angular/core';
import { AuthService as NewAuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private newAuthService: NewAuthService) {}

  // Backward compatibility methods - delegate to new service
  login(email: string, password: string) {
    return this.newAuthService.login({ email, password });
  }

  register(email: string, password: string) {
    return this.newAuthService.register({ 
      email, 
      password, 
      username: email.split('@')[0], // Simple username generation
      firstName: '',
      lastName: ''
    });
  }

  // Expose new service methods
  get isAuthenticated() {
    return this.newAuthService.isAuthenticated();
  }

  get currentUser$() {
    return this.newAuthService.currentUser$;
  }

  logout() {
    return this.newAuthService.logout();
  }
}
