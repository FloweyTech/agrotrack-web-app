import { Component, effect } from '@angular/core';
import { AuthStore } from '../../../application/auth.store';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  activeLang = 'en';

  constructor(public store: AuthStore, private router: Router, private translate: TranslateService) {
    this.activeLang = this.translate.currentLang || (localStorage.getItem('preferred-language') ?? this.translate.getDefaultLang() ?? 'en');
    this.translate.use(this.activeLang);

    this.store.logout();

    effect(() => {
      const user = this.store.user();
      const loading = this.store.loading();
      const error = this.store.error();

      if (!loading && user && !error && user.isActive()) {
        this.router.navigate(['/organization']);
      }
    });
  }

  setLanguage(lang: 'en' | 'es'): void {
    if (this.activeLang === lang) return;
    this.translate.use(lang);
    localStorage.setItem('preferred-language', lang);
    this.activeLang = lang;
  }

  onLogin(): void {
    if (!this.email || !this.password) {
      console.error('Email y password son requeridos');
      return;
    }
    this.store.login(this.email, this.password);
  }
}
