const readingList = () => import('./reading-list/reading-list').then(m => m.ReadingList);
const readingForm = () => import('./reading-form/reading-form').then(m => m.ReadingForm);
const plantRegistrationList = () => import('./plant-registration-list/plant-registration-list').then(m => m.PlantRegistrationList);

export const monitoringRoutes = [
  { path: '', loadComponent: readingList },
  { path: 'new', loadComponent: readingForm },
  { path: 'plant-registration', loadComponent: plantRegistrationList },
];
