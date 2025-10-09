const taskList = () => import('./task-list/task-list').then(m => m.TaskList);

export const taskRoutes = [
  { path: '', loadComponent: taskList },
];
