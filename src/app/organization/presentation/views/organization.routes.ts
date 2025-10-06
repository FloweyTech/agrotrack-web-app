const organizationList = () => import('./organization-list/organization-list').then(m => m.OrganizationList);
const organizationForm = () => import('./organization-form/organization-form').then(m => m.OrganizationForm);

export const organizationRoutes = [
  { path: '', loadComponent: organizationList },
  { path: 'new', loadComponent: organizationForm },
  { path: ':id/edit', loadComponent: organizationForm }
];
