import { Component, inject, Signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationStore } from '../../../application/organization.store';
import { Plot } from '../../../domain/model/plot.entity';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-plot-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslatePipe,
    DecimalPipe
  ],
  templateUrl: './plot-list.html',
  styleUrls: ['./plot-list.css']
})
export class PlotList {
  readonly store = inject(OrganizationStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  organizationId!: number;
  organizationPlots!: Signal<Plot[]>;

  constructor() {
    this.route.params.subscribe(params => {
      this.organizationId = +params['orgId'];
      if (this.organizationId) {
        // Las parcelas se cargan automáticamente en el store
        // Solo necesitamos obtener el signal filtrado
        this.organizationPlots = this.store.getPlotsByOrganizationId(this.organizationId);
      }
    });
  }

  navigateToNew(): void {
    this.router.navigate(['/organization', this.organizationId, 'plots', 'new']).then();
  }

  deletePlot(id: number): void {
    const confirmMessage = this.translate.instant('plot.deleteConfirm');
    if (confirm(confirmMessage)) {
      this.store.deletePlot(id);
    }
  }

  editPlot(id: number): void {
    this.router.navigate(['/organization', this.organizationId, 'plots', id, 'edit']).then();
  }

  goToPlantRegistrationList(plotId: number): void {
    this.router.navigate(['/monitoring/plant-registration']).then();
  }
}
