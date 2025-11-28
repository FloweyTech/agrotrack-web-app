import { Injectable, signal, computed } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';
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

  constructor(private authApi: AuthApi) {
    this.restoreSession();
  }

  login(identifier: string, password: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.authApi.login(identifier, password).pipe(
      switchMap((user) => {
        if (!user) {
          throw new Error('Usuario no encontrado');
        }
        // Guardamos el usuario y token PRIMERO para que el interceptor pueda usarlo
        this.userSignal.set(user);
        this.saveSession(user);
        
        // Ahora obtenemos el profileId con el token ya guardado
        return this.authApi.getProfileByUserId(user.id).pipe(
          map(profileId => ({ user, profileId }))
        );
      })
    ).subscribe({
      next: ({ user, profileId }) => {
        // Actualizamos la sesión con el profileId
        this.saveSession(user, profileId);
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
  }

  register(username: string, email: string, password: string, role: UserRole, firstName: string, lastName: string, photoUrl: string = ''): Observable<User> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return new Observable<User>((observer) => {
      this.authApi.register(username, email, password, role, firstName, lastName, photoUrl).subscribe({
        next: (createdUser) => {
          this.loadingSignal.set(false);
          observer.next(createdUser);
          observer.complete();
        },
        error: (err) => {
          console.error('Error en registro:', err);
          this.errorSignal.set('Error al registrar usuario: ' + (err.message || 'Error desconocido'));
          this.loadingSignal.set(false);
          observer.error(err);
        },
      });
    });
  }

  private saveSession(user: User, profileId?: number): void {
    sessionStorage.setItem('auth_user', JSON.stringify(user));
    if (user.token) {
      sessionStorage.setItem('auth_token', user.token);
    }
    if (profileId !== undefined) {
      sessionStorage.setItem('profile_id', profileId.toString());
    }
  }

  private clearSession(): void {
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('profile_id');
  }

  private restoreSession(): void {
    try {
      const stored = sessionStorage.getItem('auth_user');
      if (stored) {
        const userData = JSON.parse(stored);
        const user = new User(userData);
        this.userSignal.set(user);
      }
    } catch (error) {
      console.error('Error restaurando sesión:', error);
      this.clearSession();
    }
  }

  getToken(): string | null {
    return sessionStorage.getItem('auth_token');
  }

  getProfileId(): number | null {
    const profileId = sessionStorage.getItem('profile_id');
    return profileId ? parseInt(profileId, 10) : null;
  }
}
