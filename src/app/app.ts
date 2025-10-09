import { Component, inject, signal, effect } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Layout } from './shared/presentation/components/layout/layout';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthStore } from './iam/application/auth.store';

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
  private authStore: AuthStore;

  constructor() {
    this.translate = inject(TranslateService);
    this.router = inject(Router);
    this.authStore = inject(AuthStore);

    // Configurar idiomas disponibles
    this.translate.addLangs(['en', 'es']);

    // Establecer idioma por defecto
    this.translate.setDefaultLang('en');

    // Obtener idioma guardado o usar inglés por defecto
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    this.translate.use(savedLang);

    // Configurar layout inicial
    const currentUrl = this.router.url;
    this.showLayout.set(!this.isAuthRoute(currentUrl));

    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const isAuth = this.isAuthRoute(event.url);
        this.showLayout.set(!isAuth);
      });

    // Verificar estado de autenticación y navegar automáticamente
    effect(() => {
      const user = this.authStore.user();
      const currentUrl = this.router.url;

      if (user && this.isAuthRoute(currentUrl)) {
        // Si hay usuario logueado y estamos en ruta de auth, ir a organization
        console.log('Usuario logueado detectado, navegando a /organization');
        this.router.navigate(['/organization']);
      } else if (!user && !this.isAuthRoute(currentUrl)) {
        // Si no hay usuario y no estamos en ruta de auth, ir a login
        console.log('Usuario no logueado, navegando a /login');
        this.router.navigate(['/login']);
      }
    });
  }

  private isAuthRoute(url: string): boolean {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const authRoutes = ['/login', '/register'];
    return authRoutes.some(route =>
      cleanUrl === route ||
      cleanUrl.startsWith(route + '/')
    );
  }

  // Método público para usar en el template
  isCurrentlyAuthRoute(): boolean {
    return this.isAuthRoute(this.router.url);
  }
}
