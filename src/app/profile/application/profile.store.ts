import { Injectable, signal, computed } from '@angular/core';
import {User} from '../../iam/domain/model/user.entity';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private nameSignal = signal('Usuario');
  private avatarSignal = signal<string | null>(null);

  readonly name = computed(() => this.nameSignal());
  readonly avatarUrl = computed(() => this.avatarSignal());

  setName(name: string) {
    this.nameSignal.set(name);
  }


  setAvatar(url: string | null) {
    this.avatarSignal.set(url);
  }

  hydrateFromUser(user: User | null) {
    if (!user) { this.reset(); return; }
    this.setName(user.name ?? deriveName(user.email));
    this.setAvatar(user.avatarUrl ?? null);
  }


  reset() {
    this.nameSignal.set('Usuario');
    this.avatarSignal.set(null);
  }

}
function deriveName(email: string): string {
  const base = email?.split('@')[0] ?? 'Usuario';
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Usuario';
}

