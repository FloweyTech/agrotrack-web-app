import { Component, inject } from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationStore } from '../../../application/organization.store';
import { Organization, OrganizationStatus } from '../../../domain/model/organization.entity';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '../../../domain/model/subscription.entity';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {TranslatePipe} from '@ngx-translate/core';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import {AuthStore} from '../../../../iam/application/auth.store';


@Component({
  selector: 'app-organization-form',
  standalone: true,
  templateUrl: './organization-form.html',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    TranslatePipe,
    MatLabel,
    MatInput,
    MatError,
    MatButton,
    MatSelectModule,
    MatOptionModule
  ],
  styleUrls: ['./organization-form.css']
})
export class OrganizationForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(OrganizationStore);
  private auth = inject(AuthStore)



  form = this.fb.group({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<string>('active', { nonNullable: true }),
    plan: new FormControl<string>('AgroStart', { nonNullable: true })
  });

  isEdit = false;
  organizationId: number | null = null;
  private currentOwnerProfileId: number | null = null;

  constructor() {
    this.route.params.subscribe(params => {
      this.organizationId = params['id'] ? +params['id'] : null;
      this.isEdit = !!this.organizationId;

      if (this.isEdit && this.organizationId !== null) {
        const organization = this.store.getOrganizationById(this.organizationId)();
        if (organization) {
          this.form.patchValue({ name: organization.name });
          this.currentOwnerProfileId = organization.ownerProfileId;
        }
      }
    });
  }

  submit() {
    if (!this.form.valid) return;

    const ownerProfileId =
      this.isEdit
        ? (this.currentOwnerProfileId as number)
        : (this.auth.user()?.id ?? 0);

    const organization = new Organization({
      id: this.organizationId ?? Date.now(),
      name: this.form.value.name!,
      ownerProfileId,
      members: [],
      status: (this.form.value.status === 'inactive'
        ? OrganizationStatus.INACTIVE
        : OrganizationStatus.ACTIVE),
      subscription: new Subscription({
        id: Math.floor(Math.random() * 10000),
        plan: SubscriptionPlan.AGROSTART,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: SubscriptionStatus.ACTIVE
      })
    });

    if (this.isEdit) {
      this.store.updateOrganization(organization);
    } else {
      this.store.addOrganization(organization);
    }

    this.router.navigate(['/organization']).then();
  }

  goBack(): void {
    this.router.navigate(['/organization']).then();
  }

}
