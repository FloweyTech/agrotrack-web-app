import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatNavList, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import {MatTooltip} from '@angular/material/tooltip';
import {MatToolbar, MatToolbarRow} from '@angular/material/toolbar';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    // Angular
    RouterOutlet, RouterLink, RouterLinkActive,
    // i18n
    TranslatePipe, LanguageSwitcher,
    // Angular Material (standalone)
    MatSidenavContainer, MatSidenav, MatSidenavContent, MatIcon, MatIconButton,
    MatNavList, MatListItem, MatListItemIcon, MatListItemTitle, MatTooltip, MatToolbar, MatToolbarRow, NgOptimizedImage
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class Layout {
  isMenuOpen = true;

  options = [
    { label: 'Organization',  icon: 'business',      route: '/organizations' },
    { label: 'Tasks', icon: 'assignment_turned_in', route: '/subscriptions' },
    { label: 'Settings',      icon: 'settings',      route: '/settings' }
  ];

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
