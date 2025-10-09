import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

interface Task {
  id: string;
  titleKey: string;
  descriptionKey: string;
  categoryKey: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'inProgress' | 'completed';
  assignedBy: string;
  dueDate: string;
  completed: boolean;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskList {
  selectedFilter = 'all';
  selectedCategory = 'all';
  selectedPriority = 'all';

  tasks: Task[] = [
    {
      id: 'task1',
      titleKey: 'tasks.list.task1.title',
      descriptionKey: 'tasks.list.task1.description',
      categoryKey: 'tasks.categories.irrigation',
      priority: 'high',
      status: 'pending',
      assignedBy: 'Dr. María González',
      dueDate: '2025-01-12',
      completed: false
    },
    {
      id: 'task2',
      titleKey: 'tasks.list.task2.title',
      descriptionKey: 'tasks.list.task2.description',
      categoryKey: 'tasks.categories.fertilization',
      priority: 'medium',
      status: 'pending',
      assignedBy: 'Ing. Carlos Rodríguez',
      dueDate: '2025-01-15',
      completed: false
    },
    {
      id: 'task3',
      titleKey: 'tasks.list.task3.title',
      descriptionKey: 'tasks.list.task3.description',
      categoryKey: 'tasks.categories.pest_control',
      priority: 'high',
      status: 'inProgress',
      assignedBy: 'Dr. María González',
      dueDate: '2025-01-10',
      completed: false
    },
    {
      id: 'task4',
      titleKey: 'tasks.list.task4.title',
      descriptionKey: 'tasks.list.task4.description',
      categoryKey: 'tasks.categories.monitoring',
      priority: 'medium',
      status: 'completed',
      assignedBy: 'Ing. Ana López',
      dueDate: '2025-01-08',
      completed: true
    },
    {
      id: 'task5',
      titleKey: 'tasks.list.task5.title',
      descriptionKey: 'tasks.list.task5.description',
      categoryKey: 'tasks.categories.maintenance',
      priority: 'low',
      status: 'pending',
      assignedBy: 'Dr. María González',
      dueDate: '2025-01-20',
      completed: false
    },
    {
      id: 'task6',
      titleKey: 'tasks.list.task6.title',
      descriptionKey: 'tasks.list.task6.description',
      categoryKey: 'tasks.categories.soil_preparation',
      priority: 'high',
      status: 'pending',
      assignedBy: 'Ing. Carlos Rodríguez',
      dueDate: '2025-01-14',
      completed: false
    },
    {
      id: 'task7',
      titleKey: 'tasks.list.task7.title',
      descriptionKey: 'tasks.list.task7.description',
      categoryKey: 'tasks.categories.harvest',
      priority: 'medium',
      status: 'pending',
      assignedBy: 'Ing. Ana López',
      dueDate: '2025-01-11',
      completed: false
    },
    {
      id: 'task8',
      titleKey: 'tasks.list.task8.title',
      descriptionKey: 'tasks.list.task8.description',
      categoryKey: 'tasks.categories.pest_control',
      priority: 'high',
      status: 'completed',
      assignedBy: 'Dr. María González',
      dueDate: '2025-01-09',
      completed: true
    }
  ];

  get filteredTasks(): Task[] {
    return this.tasks.filter(task => {
      const statusFilter = this.selectedFilter === 'all' ||
        (this.selectedFilter === 'pending' && !task.completed) ||
        (this.selectedFilter === 'completed' && task.completed);

      const categoryFilter = this.selectedCategory === 'all' ||
        task.categoryKey.includes(this.selectedCategory);

      const priorityFilter = this.selectedPriority === 'all' ||
        task.priority === this.selectedPriority;

      return statusFilter && categoryFilter && priorityFilter;
    });
  }

  toggleTaskCompletion(task: Task): void {
    task.completed = !task.completed;
    task.status = task.completed ? 'completed' : 'pending';
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'priority_high';
      case 'medium': return 'remove';
      case 'low': return 'keyboard_arrow_down';
      default: return 'remove';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'warn';
      case 'medium': return 'accent';
      case 'low': return 'primary';
      default: return 'primary';
    }
  }

  getCategoryIcon(categoryKey: string): string {
    if (categoryKey.includes('irrigation')) return 'water_drop';
    if (categoryKey.includes('fertilization')) return 'eco';
    if (categoryKey.includes('pest_control')) return 'pest_control';
    if (categoryKey.includes('harvest')) return 'agriculture';
    if (categoryKey.includes('soil_preparation')) return 'landscape';
    if (categoryKey.includes('monitoring')) return 'visibility';
    if (categoryKey.includes('maintenance')) return 'build';
    return 'task';
  }
}
