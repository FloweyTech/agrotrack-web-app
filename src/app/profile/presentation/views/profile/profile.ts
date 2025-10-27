import {Component, inject, input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {ProfileStore} from '../../../application/profile.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatIcon
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  private readonly store = inject(ProfileStore);


  readonly name = this.store.name;              // Signal<string>
  readonly avatarUrl = this.store.avatarUrl;    // Signal<string | null>
}
