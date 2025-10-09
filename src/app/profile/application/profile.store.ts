import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private nameSignal = signal('Usuario');
  private avatarSignal = signal<string | null>(null);

  readonly name = computed(() => this.nameSignal());
  readonly avatarUrl = computed(() => this.avatarSignal());

  setName(name: string) {
    this.nameSignal.set(name);
  }

  setAvatar(url: string) {
    this.avatarSignal.set(url);
  }
}
