import { Routes } from '@angular/router';

const baseTitle = 'Agrotrack';
export const routes: Routes = [
  { path: '', redirectTo: '/organization', pathMatch: 'full' },
  { path: 'organization', loadChildren: () => import('./organization/presentation/views/organization.routes').then(m=> m.organizationRoutes) }
];
