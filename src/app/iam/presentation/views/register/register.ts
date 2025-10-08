import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '../../../application/auth.store';
import { UserRole } from '../../../domain/model/user.role.enum';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
      
      if (!loading && user && !error) {
        console.log('Registro exitoso, redirigiendo a /organization');
        this.router.navigate(['/organization']);
      }
    });
  }

  onRegister(): void {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const role = this.roleAgronomist ? UserRole.AGRONOMIST : UserRole.FARMER;
    this.store.register(this.email, this.password, role);
  }
}