import { Injectable, signal, computed } from '@angular/core';
import { User } from '../domain/model/user.entity';
import { UserRole } from '../domain/model/user.role.enum';
import { AuthApi } from '../infrastructure/auth-api';
import { UserStatus } from '../domain/model/user-status.enum';

@Injectable({ providedIn: 'root' })
export class AuthStore {

  private readonly userSignal = signal<User | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly isLoggedIn = computed(() => this.userSignal() !== null);
  readonly isAgronomist = computed(
    () => this.userSignal()?.role === UserRole.AGRONOMIST
  );
  readonly isFarmer = computed(() => this.userSignal()?.role === UserRole.FARMER);

  constructor(private authApi: AuthApi) {}

  login(email: string, password: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.authApi.login(email, password).subscribe({
      next: (user) => {
        if (user && user.isActive()) {
          this.userSignal.set(user);
        } else {
          this.errorSignal.set('Usuario inactivo o no encontrado');
        }
        this.loadingSignal.set(false);
      },
      error: () => {
        this.errorSignal.set('Error al iniciar sesión');
        this.loadingSignal.set(false);
      },
    });
  }

  logout(): void {
    this.userSignal.set(null);
  }


  register(email: string, password: string, role: UserRole): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const newUser = new User({
      id: Date.now(),
      email,
      passwordHash: password,
      role,
      status: UserStatus.ACTIVE,
    });

    this.authApi.register(newUser).subscribe({
      next: (createdUser) => {
        this.userSignal.set(createdUser);
        this.loadingSignal.set(false);
      },
      error: () => {
        this.errorSignal.set('Error al registrar usuario');
        this.loadingSignal.set(false);
      },
    });
  }

  restoreSession(): void {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      const parsed = JSON.parse(stored) as User;
      this.userSignal.set(parsed);
    }
  }

  persistSession(): void {
    if (this.userSignal()) {
      localStorage.setItem('auth_user', JSON.stringify(this.userSignal()));
    }
  }
}