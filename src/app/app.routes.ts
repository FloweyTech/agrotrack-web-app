import { Routes } from '@angular/router';

const baseTitle = 'Agrotrack';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./iam/presentation/views/login/login').then(m => m.LoginComponent),
    title: `${baseTitle} | Login`
  },
  {
    path: 'register',
    loadComponent: () => import('./iam/presentation/views/register/register').then(m => m.RegisterComponent),
    title: `${baseTitle} | Register`
  },
  {
    path: 'organization',
    loadChildren: () =>
      import('./organization/presentation/views/organization.routes').then(m => m.organizationRoutes),
    title: `${baseTitle} | Organizations`
  },
  {
    path: 'report',
    loadChildren: () =>
      import('./report/presentation/views/report.routes').then(m => m.reportRoutes),
    title: `${baseTitle} | Reports`
  },
  {
    path: 'monitoring',
    loadChildren: () =>
      import('./monitoring-control/presentation/views/monitoring.routes').then(m => m.monitoringRoutes),
    title: `${baseTitle} | Monitoring`
  },
  {
    path: 'tasks',
    loadChildren: () =>
      import('./monitoring-control/presentation/views/task.routes').then(m => m.taskRoutes),
    title: `${baseTitle} | Tasks`
  },
  { path: '**', loadComponent:() => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound),
  title: `${baseTitle} | Page Not Found`}
];
