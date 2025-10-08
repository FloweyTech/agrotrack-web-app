import { Component, effect } from '@angular/core';
import { AuthStore } from '../../../application/auth.store';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(public store: AuthStore, private router: Router) {
    this.store.logout();
    
    effect(() => {
      const user = this.store.user();
      const loading = this.store.loading();
      const error = this.store.error();
      
      if (!loading && user && !error) {
        console.log('Login exitoso, redirigiendo a /organization');
        this.router.navigate(['/organization']);
      }
    });
  }

  onLogin(): void {
    console.log('Intentando login con:', this.email);
    this.store.login(this.email, this.password);
  }
}