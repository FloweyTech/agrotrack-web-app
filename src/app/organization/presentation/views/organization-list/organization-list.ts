import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationStore } from '../../../application/organization.store';
import { AuthStore } from '../../../../iam/application/auth.store';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe],
  templateUrl: './organization-list.html',
  styleUrls: ['./organization-list.css']
})
export class OrganizationList implements OnInit {
  readonly store = inject(OrganizationStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  ngOnInit(): void {
    const profileId = this.authStore.getProfileId();
    if (profileId) {
      this.store.loadOrganizationsByOwner(profileId);
    } else {
      console.error('No profile ID found in session');
    }
  }

  navigateToOrganization(id: number): void {
    this.router.navigate(['/organization', id]).then();
  }

  navigateToNew(): void {
    this.router.navigate(['/organization/new']).then();
  }

  deleteOrganization(id: number): void {
    const confirmMessage = this.translate.instant('organization.delete-confirm');
    if (confirm(confirmMessage)) {
      this.store.deleteOrganization(id);
    }
  }

  editOrganization(id: number): void {
    this.router.navigate(['/organization', id, 'edit']).then();
  }
}
