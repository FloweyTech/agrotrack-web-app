const readingList = () => import('./reading-list/reading-list').then(m => m.ReadingList);
const readingForm = () => import('./reading-form/reading-form').then(m => m.ReadingForm);

export const monitoringRoutes = [
  { path: '', loadComponent: readingList },
  { path: 'new', loadComponent: readingForm }
];
