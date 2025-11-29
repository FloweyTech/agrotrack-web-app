const organizationList = () => import('./organization-list/organization-list').then(m => m.OrganizationList);
const organizationForm = () => import('./organization-form/organization-form').then(m => m.OrganizationForm);
const plotList = () => import('./plot-list/plot-list').then(m => m.PlotList);
const plotForm = () => import('./plot-form/plot-form').then(m => m.PlotForm);
const organizationMembers = () => import('./organization-members/organization-members').then(m => m.OrganizationMembers);

export const organizationRoutes = [
  { path: '', loadComponent: organizationList },
  { path: 'new', loadComponent: organizationForm },
  { path: ':id/edit', loadComponent: organizationForm },
  { path: ':id/members', loadComponent: organizationMembers },
  {
    path: ':orgId/plots',
    children: [
      { path: '', loadComponent: plotList },
      { path: 'new', loadComponent: plotForm },
      { path: ':id/edit', loadComponent: plotForm }
    ]
  }
];
