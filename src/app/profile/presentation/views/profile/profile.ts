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
  private store = inject(ProfileStore);

  name = input<string>('Usuario');
  avatarUrl = input<string | null>(null);
}
