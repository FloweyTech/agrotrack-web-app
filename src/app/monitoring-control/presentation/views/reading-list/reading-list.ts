import { Component, inject, OnInit } from '@angular/core';
import { MonitoringStore } from '../../../application/monitoring-control.store';
import { OrganizationStore } from '../../../../organization/application/organization.store';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import {RouterLink} from '@angular/router';

/**
 * Displays the list of environmental readings and alerts.
 */
@Component({
  selector: 'app-reading-list',
  standalone: true,
  templateUrl: './reading-list.html',
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    DatePipe,
    RouterLink
  ],
  styleUrls: ['./reading-list.css']
})
export class ReadingList implements OnInit {
  readonly monitoringStore = inject(MonitoringStore);
  readonly organizationStore = inject(OrganizationStore);
  private readonly translateService = inject(TranslateService);

  /** Columns to display in the Material table. */
  displayedColumns: string[] = ['plot', 'type', 'value', 'measuredAt'];

  ngOnInit(): void {
    // Cargar todas las lecturas ambientales al iniciar
    this.monitoringStore.loadAllReadings();
  }

  /** Gets the plot name by ID. */
  getPlotName(plotId: number): string {
    const plot = this.organizationStore.plots().find(p => p.id === plotId);
    return plot ? plot.name : '—';
  }

  /** Clears alert messages. */
  clearAlerts(): void {
    this.monitoringStore.clearAlerts();
  }

  /** Gets the CSS class for reading type badge */
  getTypeClass(type: string): string {
    switch (type) {
      case 'TEMPERATURE': return 'type-temperature';
      case 'HUMIDITY': return 'type-humidity';
      case 'PH_LEVEL': return 'type-ph';
      default: return 'type-default';
    }
  }

  /** Gets the icon for reading type */
  getTypeIcon(type: string): string {
    switch (type) {
      case 'TEMPERATURE': return 'thermostat';
      case 'HUMIDITY': return 'water_drop';
      case 'PH_LEVEL': return 'science';
      default: return 'sensors';
    }
  }

  /** Gets the icon class for reading type */
  getTypeIconClass(type: string): string {
    switch (type) {
      case 'TEMPERATURE': return 'icon-temperature';
      case 'HUMIDITY': return 'icon-humidity';
      case 'PH_LEVEL': return 'icon-ph';
      default: return 'icon-default';
    }
  }

  /** Gets the display name for reading type using translations */
  getTypeDisplayName(type: string): string {
    return this.translateService.instant(`monitoring.types.${type}`);
  }

  /** Gets relative time display using translations */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return this.translateService.instant('monitoring.time.moment');
    if (diffMins < 60) return this.translateService.instant('monitoring.time.minutes', { count: diffMins });
    if (diffHours < 24) return this.translateService.instant('monitoring.time.hours', { count: diffHours });
    if (diffDays < 7) return this.translateService.instant('monitoring.time.days', { count: diffDays });
    return this.translateService.instant('monitoring.time.week');
  }

  /** Gets CSS class for table row based on reading values */
  getRowClass(reading: any): string {
    if (this.isOutOfRange(reading)) {
      return 'row-alert';
    }
    return 'row-normal';
  }

  /** Checks if reading is out of safe range */
  private isOutOfRange(reading: any): boolean {
    switch (reading.type) {
      case 'TEMPERATURE':
        return reading.value < 10 || reading.value > 35;
      case 'HUMIDITY':
        return reading.value < 40 || reading.value > 80;
      case 'PH_LEVEL':
        return reading.value < 5.5 || reading.value > 7.5;
      default:
        return false;
    }
  }

  /** Handles row click event */
  onRowClick(reading: any): void {
    console.log('Clicked reading:', reading);
    // Aquí podrías agregar navegación a una vista de detalle
  }
}
