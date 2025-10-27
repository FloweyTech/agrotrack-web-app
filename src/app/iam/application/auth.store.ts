import {Injectable, signal, computed, inject} from '@angular/core';
import { User } from '../domain/model/user.entity';
import { UserRole } from '../domain/model/user.role.enum';
import { AuthApi } from '../infrastructure/auth-api';
import { UserStatus } from '../domain/model/user-status.enum';
import {ProfileStore} from '../../profile/application/profile.store';

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

  private readonly profileStore = inject(ProfileStore);

  constructor(private authApi: AuthApi) {
    this.restoreSession();
  }

  login(email: string, password: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.authApi.login(email, password).subscribe({
      next: (user) => {
        if (user && user.isActive()) {
          this.userSignal.set(user);
          this.saveSession(user);
          this.profileStore.hydrateFromUser(user);
        } else {
          this.errorSignal.set('Usuario inactivo o no encontrado');
          this.profileStore.reset();
        }
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorSignal.set('Error al iniciar sesión: ' + (err.message || 'Error desconocido'));
        this.loadingSignal.set(false);
      },
    });
  }

  logout(): void {
    this.userSignal.set(null);
    this.errorSignal.set(null);
    this.clearSession();
    this.profileStore.reset();
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
        this.saveSession(createdUser);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.errorSignal.set('Error al registrar usuario: ' + (err.message || 'Error desconocido'));
        this.loadingSignal.set(false);
      },
    });
  }

  private saveSession(user: User): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  private clearSession(): void {
    localStorage.removeItem('auth_user');
  }

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        const userData = JSON.parse(stored);
        const user = new User(userData);
        this.userSignal.set(user);
        this.profileStore.hydrateFromUser(user);
      } else {
        this.profileStore.reset();
      }
    } catch (error) {
      console.error('Error restaurando sesión:', error);
      this.clearSession();
      this.profileStore.reset();
    }
  }
}
