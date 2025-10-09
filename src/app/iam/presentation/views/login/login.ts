import { Component, effect } from '@angular/core';
import { AuthStore } from '../../../application/auth.store';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
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

      console.log('Login Effect - Estado actual:', {
        user: user,
        loading: loading,
        error: error,
        userActive: user ? user.isActive() : null
      });

      if (!loading && user && !error && user.isActive()) {
        console.log('Login exitoso, redirigiendo a /organization');
        this.router.navigate(['/organization']).then(
          (success) => console.log('Navegación exitosa:', success),
          (error) => console.error('Error en navegación:', error)
        );
      } else if (!loading && error) {
        console.error('Error en login:', error);
      }
    });
  }

  onLogin(): void {
    if (!this.email || !this.password) {
      console.error('Email y password son requeridos');
      return;
    }

    console.log('Intentando login con:', this.email);
    this.store.login(this.email, this.password);
  }
}
