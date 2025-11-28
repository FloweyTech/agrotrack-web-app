import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '../../../application/auth.store';
import { UserRole } from '../../../domain/model/user.role.enum';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  username = '';
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  photoUrl = '';
  selectedRole: UserRole | null = null;
  
  readonly UserRole = UserRole;

  constructor(public store: AuthStore, private router: Router) {
    this.store.logout();
  }

  onRegister(): void {
    // Validaciones
    if (!this.username || !this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword) {
      console.error('Todos los campos son requeridos');
      alert('Todos los campos son requeridos');
      return;
    }

    if (this.password !== this.confirmPassword) {
      console.error('Las contraseñas no coinciden');
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!this.selectedRole) {
      console.error('Debe seleccionar un rol');
      alert('Debe seleccionar un rol (Agronomist o Farmer)');
      return;
    }

    console.log('Intentando registro con:', { 
      username: this.username, 
      email: this.email, 
      role: this.selectedRole,
      firstName: this.firstName,
      lastName: this.lastName 
    });
    
    this.store.register(
      this.username, 
      this.email, 
      this.password, 
      this.selectedRole,
      this.firstName,
      this.lastName,
      this.photoUrl
    ).subscribe({
      next: (user) => {
        console.log('Registro exitoso:', user);
        alert('Registro exitoso. Por favor, inicia sesión con tus credenciales.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        alert('Error al registrar usuario: ' + (err.message || 'Error desconocido'));
      }
    });
  }
}
