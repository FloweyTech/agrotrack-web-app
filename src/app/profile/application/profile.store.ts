import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs';

export interface Profile {
  id: number;
  profileId: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  photoUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly http = inject(HttpClient);
  
  private nameSignal = signal('Usuario');
  private avatarSignal = signal<string | null>(null);
  private profilesSignal = signal<Profile[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  readonly name = computed(() => this.nameSignal());
  readonly avatarUrl = computed(() => this.avatarSignal());
  readonly profiles = this.profilesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  setName(name: string) {
    this.nameSignal.set(name);
  }

  setAvatar(url: string) {
    this.avatarSignal.set(url);
  }

  /**
   * Load profiles by their IDs
   */
  loadProfilesByIds(profileIds: number[]): void {
    if (profileIds.length === 0) {
      this.profilesSignal.set([]);
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const requests = profileIds.map(id =>
      this.http.get<Profile>(`${environment.platformProviderApiBaseUrl}/api/v1/profiles/${id}`).pipe(
        catchError(err => {
          console.error(`Error loading profile ${id}:`, err);
          return of(null);
        })
      )
    );

    forkJoin(requests).subscribe({
      next: (profiles) => {
        const validProfiles = profiles.filter((p): p is Profile => p !== null);
        this.profilesSignal.set(validProfiles);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set('Error loading profiles');
        this.loadingSignal.set(false);
        console.error('Error loading profiles:', err);
      }
    });
  }

  /**
   * Clear loaded profiles
   */
  clearProfiles(): void {
    this.profilesSignal.set([]);
  }
}
