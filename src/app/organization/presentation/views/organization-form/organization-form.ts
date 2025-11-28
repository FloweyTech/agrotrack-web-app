import { Component, inject, effect } from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { OrganizationStore } from '../../../application/organization.store';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {TranslatePipe} from '@ngx-translate/core';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

enum SubscriptionPlan {
  AGRO_START = 'AGRO_START',
  AGRO_SMART = 'AGRO_SMART',
  AGRO_EXPERT = 'AGRO_EXPERT'
}

interface PlanOption {
  value: SubscriptionPlan;
  name: string;
  benefits: string[];
  icon: string;
}

@Component({
  selector: 'app-organization-form',
  standalone: true,
  templateUrl: './organization-form.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormField,
    TranslatePipe,
    MatLabel,
    MatInput,
    MatError,
    MatButton,
    MatCardModule,
    MatRadioModule,
    MatIconModule
  ],
  styleUrls: ['./organization-form.css']
})
export class OrganizationForm {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly store = inject(OrganizationStore);

  step: 'plan' | 'duration' | 'name' = 'plan';
  selectedPlan: SubscriptionPlan | null = null;
  selectedDuration: number | null = null;
  private formSubmitted = false;

  plans: PlanOption[] = [
    {
      value: SubscriptionPlan.AGRO_START,
      name: 'Agro Start',
      benefits: ['Up to 5 plots', 'Basic monitoring', 'Email support'],
      icon: 'agriculture'
    },
    {
      value: SubscriptionPlan.AGRO_SMART,
      name: 'Agro Smart',
      benefits: ['Up to 20 plots', 'Advanced monitoring', 'Priority support', 'Analytics dashboard'],
      icon: 'speed'
    },
    {
      value: SubscriptionPlan.AGRO_EXPERT,
      name: 'Agro Expert',
      benefits: ['Unlimited plots', 'Premium monitoring', '24/7 support', 'Advanced analytics', 'Custom reports'],
      icon: 'workspace_premium'
    }
  ];

  durations = [
    { months: 1, label: '1 Month' },
    { months: 3, label: '3 Months' },
    { months: 12, label: '12 Months' }
  ];

  form = this.fb.group({
    organizationName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor() {
    effect(() => {
      const loading = this.store.loading();
      const error = this.store.error();

      if (this.formSubmitted && !loading && !error) {
        console.log('Organization created successfully, redirecting...');
        this.router.navigate(['/organization']);
      } else if (this.formSubmitted && !loading && error) {
        console.error('Error creating organization:', error);
        alert('Error creating organization: ' + error);
        this.formSubmitted = false;
      }
    });
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
    this.step = 'duration';
  }

  selectDuration(months: number): void {
    this.selectedDuration = months;
    this.step = 'name';
  }

  goBack(): void {
    if (this.step === 'duration') {
      this.step = 'plan';
      this.selectedPlan = null;
    } else if (this.step === 'name') {
      this.step = 'duration';
      this.selectedDuration = null;
    } else {
      this.router.navigate(['/organization']).then();
    }
  }

  submit(): void {
    if (!this.form.valid || !this.selectedPlan || !this.selectedDuration) {
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + this.selectedDuration);

    this.formSubmitted = true;
    this.store.createOrganizationWithSubscription({
      subscriptionPlan: this.selectedPlan,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      organizationName: this.form.value.organizationName!
    });
  }
}
