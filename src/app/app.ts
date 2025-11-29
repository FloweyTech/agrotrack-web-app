import { Component, inject, signal, effect } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, Event as RouterEvent } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Layout } from './shared/presentation/components/layout/layout';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  imports: [
    Layout,
    RouterOutlet,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('agrotrack-web-app');
  showLayout = signal(false);

  private translate = inject(TranslateService);
  private router = inject(Router);


  constructor() {
    // Configuración de idioma
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    this.translate.use(savedLang);


    this.router.events
      .pipe(
        filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        const isAuthPage = event.urlAfterRedirects.includes('/login') || event.urlAfterRedirects.includes('/register');
        this.showLayout.set(!isAuthPage);
      });

  }
}
