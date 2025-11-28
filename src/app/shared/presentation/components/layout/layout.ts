import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import {Profile} from '../../../../profile/presentation/views/profile/profile';


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
    MatNavList, MatListItem, MatListItemIcon, MatListItemTitle, MatTooltip, MatToolbar, MatToolbarRow, NgOptimizedImage, Profile
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class Layout implements OnInit, OnDestroy{
  @ViewChild(MatSidenav) sidenav!: MatSidenav;

  isMenuOpen = true;
  isMobile = false;

  private destroy$ = new Subject<void>();

  options = [
    { labelKey: 'nav.organization', icon: 'business',             route: '/organization' },
    { labelKey: 'nav.reports',      icon: 'assessment',           route: '/report' },
    { labelKey: 'nav.tasks',        icon: 'assignment_turned_in', route: '/tasks' },
    { labelKey: 'nav.monitoring',   icon: 'visibility',           route: '/monitoring' },
    { labelKey: 'nav.weather',      icon: 'cloud_queue',          route: '/monitoring/weather' },
    { labelKey: 'nav.settings',     icon: 'settings',             route: '/settings' },
  ];

  constructor(private bp: BreakpointObserver) {}

  ngOnInit() {
    this.bp.observe(['(max-width: 800px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isMobile = state.matches;
        if (this.isMobile) this.isMenuOpen = false;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isCollapsed = true;

  toggleMenu() {
    if (this.isMobile) {
      this.sidenav.toggle().catch(() => {});
      this.isCollapsed = false;
    } else {
      this.sidenav.open().catch(() => {});
      this.isCollapsed = !this.isCollapsed;
    }
  }
}
