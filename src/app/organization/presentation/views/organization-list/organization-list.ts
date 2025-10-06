import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationStore } from '../../../application/organization.store';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe, TitleCasePipe, DatePipe],
  templateUrl: './organization-list.html',
  styleUrls: ['./organization-list.css']
})
export class OrganizationList {
  readonly store = inject(OrganizationStore);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

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
