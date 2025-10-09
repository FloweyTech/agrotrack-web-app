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
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  roleAgronomist = false;
  roleFarmer = false;

  constructor(public store: AuthStore, private router: Router) {
    this.store.logout();

    effect(() => {
      const user = this.store.user();
      const loading = this.store.loading();
      const error = this.store.error();

      console.log('Register Effect - Estado actual:', {
        user: user,
        loading: loading,
        error: error,
        userActive: user ? user.isActive() : null
      });

      if (!loading && user && !error && user.isActive()) {
        console.log('Registro exitoso, redirigiendo a /organization');
        this.router.navigate(['/organization']).then(
          (success) => console.log('Navegación exitosa:', success),
          (error) => console.error('Error en navegación:', error)
        );
      } else if (!loading && error) {
        console.error('Error en registro:', error);
      }
    });
  }

  onRegister(): void {
    // Validaciones
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      console.error('Todos los campos son requeridos');
      alert('Todos los campos son requeridos');
      return;
    }

    if (this.password !== this.confirmPassword) {
      console.error('Las contraseñas no coinciden');
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!this.roleAgronomist && !this.roleFarmer) {
      console.error('Debe seleccionar al menos un rol');
      alert('Debe seleccionar al menos un rol (Agronomist o Farmer)');
      return;
    }

    const role = this.roleAgronomist ? UserRole.AGRONOMIST : UserRole.FARMER;
    console.log('Intentando registro con:', { email: this.email, role });
    this.store.register(this.email, this.password, role);
  }
}
