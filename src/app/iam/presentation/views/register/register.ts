import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '../../../application/auth.store';
import { UserRole } from '../../../domain/model/user.role.enum';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  roleAgronomist = false;
  roleFarmer = false;
  activeLang: 'en' | 'es' = 'en';

  constructor(public store: AuthStore, private router: Router, private translate: TranslateService) {
    this.activeLang = (localStorage.getItem('preferred-language') || 'en') as 'en' | 'es';
    this.translate.use(this.activeLang);

    this.store.logout();

    effect(() => {
      const user = this.store.user();
      const loading = this.store.loading();
      const error = this.store.error();

      console.log('Register Effect - Estado actual:', { user, loading, error, userActive: user ? user.isActive() : null });

      if (!loading && user && !error && user.isActive()) {
        console.log('Registro exitoso, redirigiendo a /organization');
        this.router.navigate(['/organization']).then(
          success => console.log('Navegación exitosa:', success),
          err => console.error('Error en navegación:', err)
        );
      } else if (!loading && error) {
        console.error('Error en registro:', error);
      }
    });
  }

  setLanguage(lang: 'en' | 'es'): void {
    if (this.activeLang === lang) return;
    this.translate.use(lang);
    localStorage.setItem('preferred-language', lang);
    this.activeLang = lang;
  }

  onRegister(): void {
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
