const taskList = () => import('./task-list/task-list').then(m => m.TaskList);
const taskCreate = () => import('./task-create/task-create').then(m => m.TaskCreate);

export const taskRoutes = [
  { path: '', loadComponent: taskList },
  { path: 'create', loadComponent: taskCreate },
];
