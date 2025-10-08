import { Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
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
  showLayout = signal(true);
  
  private translate: TranslateService;
  private router: Router;

  constructor() {
    this.translate = inject(TranslateService);
    this.router = inject(Router);
    
    this.translate.addLangs(['en', 'es']);
    this.translate.use('en');

    const currentUrl = this.router.url;
    this.showLayout.set(!this.isAuthRoute(currentUrl));

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Navegando a:', event.url); 
        console.log('Es ruta de auth:', this.isAuthRoute(event.url)); // Debug
        
        const isAuth = this.isAuthRoute(event.url);
        this.showLayout.set(!isAuth);
        
        if (isAuth && this.showLayout()) {
          console.log('Forzando ocultación del layout para ruta de auth');
          this.showLayout.set(false);
        }

        
        setTimeout(() => {
          if (isAuth && this.showLayout()) {
            console.log('Aplicando corrección final del layout');
            this.showLayout.set(false);
          }
        }, 0);
      });
  }

  private isAuthRoute(url: string): boolean {
    
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    const authRoutes = ['/login', '/register'];
    const isAuth = authRoutes.some(route => 
      cleanUrl === route || 
      cleanUrl.startsWith(route + '/') ||
      cleanUrl.endsWith(route)
    );
    
    console.log(`URL: ${url} -> Clean: ${cleanUrl} -> IsAuth: ${isAuth}`);
    return isAuth;
  }

  // Método público para usar en el template
  isCurrentlyAuthRoute(): boolean {
    return this.isAuthRoute(this.router.url);
  }
}
