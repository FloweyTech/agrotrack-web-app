import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationStore } from '../../../application/organization.store';
import { AuthStore } from '../../../../iam/application/auth.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-organization-view',
  standalone: true,
  imports: [CommonModule],
  template: `<div style="text-align: center; padding: 2rem;">
    <p>Loading organization...</p>
  </div>`
})
export class OrganizationView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(OrganizationStore);
  private authStore = inject(AuthStore);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const organizationId = +params['orgId'];
      
      // Get organization details from the list
      const profileId = this.authStore.getProfileId();
      if (profileId) {
        const organizations = this.store.organizationsByOwner();
        const org = organizations.find(o => o.organizationId === organizationId);
        
        if (org) {
          if (org.isActive) {
            // Organization is active, show plots
            this.router.navigate(['/organization', organizationId, 'plots']);
          } else {
            // Organization is inactive, show payment
            this.router.navigate(['/organization', organizationId, 'payment']);
          }
        } else {
          // Organization not found, go back to list
          this.router.navigate(['/organization']);
        }
      }
    });
  }
}
