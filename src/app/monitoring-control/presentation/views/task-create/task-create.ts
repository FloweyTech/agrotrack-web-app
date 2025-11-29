import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MonitoringStore } from '../../../application/monitoring-control.store';
import { OrganizationStore } from '../../../../organization/application/organization.store';
import { ProfileStore } from '../../../../profile/application/profile.store';
import { Task } from '../../../domain/model/task.entity';

interface OrganizationOption {
  id: number;
  name: string;
  profileIds: number[];
}

interface ProfileOption {
  profileId: number;
  fullName: string;
  photoUrl: string;
}

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule
  ],
  templateUrl: './task-create.html',
  styleUrl: './task-create.css'
})
export class TaskCreate implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly monitoringStore = inject(MonitoringStore);
  readonly organizationStore = inject(OrganizationStore);
  readonly profileStore = inject(ProfileStore);

  taskForm!: FormGroup;
  organizations: OrganizationOption[] = [];
  profiles: ProfileOption[] = [];
  assigneeProfileId: number = 0;

  ngOnInit(): void {
    this.initForm();
    this.loadAssigneeProfile();
    this.loadOrganizations();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      organizationId: [null, Validators.required],
      assignedToProfileId: [null, Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startDate: [new Date(), Validators.required],
      endDate: [null, Validators.required],
      materials: this.fb.array([])
    });
  }

  get materials(): FormArray {
    return this.taskForm.get('materials') as FormArray;
  }

  private loadAssigneeProfile(): void {
    const profileIdStr = sessionStorage.getItem('profile_id');
    if (profileIdStr) {
      this.assigneeProfileId = parseInt(profileIdStr, 10);
    }
  }

  private loadOrganizations(): void {
    if (!this.assigneeProfileId) return;

    // Use by-owner to load organizations where user is owner/can assign tasks
    this.organizationStore.loadOrganizationsByOwner(this.assigneeProfileId);
  }

  get organizationsFromStore() {
    return this.organizationStore.organizationsByOwner().map(org => ({
      id: org.organizationId,
      name: org.organizationName,
      profileIds: org.profileIds
    }));
  }

  onOrganizationChange(organizationId: number): void {
    const selectedOrg = this.organizationsFromStore.find(org => org.id === organizationId);
    
    if (selectedOrg && selectedOrg.profileIds.length > 0) {
      // Load profiles for selected organization
      this.profileStore.loadProfilesByIds(selectedOrg.profileIds);
      
      // Enable assigned profile field
      this.taskForm.get('assignedToProfileId')?.enable();
    } else {
      this.profiles = [];
      this.taskForm.get('assignedToProfileId')?.disable();
      this.taskForm.get('assignedToProfileId')?.setValue(null);
    }
  }

  get profilesFromStore() {
    return this.profileStore.profiles();
  }

  addMaterial(): void {
    const materialGroup = this.fb.group({
      materialName: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.1)]],
      unit: ['', Validators.required]
    });
    this.materials.push(materialGroup);
  }

  removeMaterial(index: number): void {
    this.materials.removeAt(index);
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;
    
    const task: Task = new Task({
      assigneeProfileId: this.assigneeProfileId,
      assignedToProfileId: formValue.assignedToProfileId,
      organizationId: formValue.organizationId,
      title: formValue.title,
      description: formValue.description,
      startDate: this.formatDate(formValue.startDate),
      endDate: this.formatDate(formValue.endDate),
      taskStatus: 'PENDING',
      materialsUsed: formValue.materials || []
    });

    this.monitoringStore.createTask(task);
    
    // Navigate back to task list
    this.router.navigate(['/tasks']);
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
