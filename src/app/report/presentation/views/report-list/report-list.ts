import { Component, OnInit, effect, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ReportStore } from '../../../application/report.store';
import { Report } from '../../../domain/model/report.entity';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    RouterModule,
    TranslatePipe
  ],
  templateUrl: './report-list.html',
  styleUrls: ['./report-list.css']
})
export class ReportListComponent implements OnInit, OnDestroy {
  displayedColumns = ['id', 'organizationName', 'type', 'status', 'period', 'actions'];
  organizations: string[] = [];
  filteredReports: Report[] = [];
  selectedOrganization: string = '';
  private langSub: any;

  constructor(public store: ReportStore, private translate: TranslateService, private cdr: ChangeDetectorRef) {
    effect(() => {
      const reports = this.store.reports();
      this.filteredReports = this.selectedOrganization
        ? reports.filter(r => r.organizationName === this.selectedOrganization)
        : reports;
      this.organizations = [...new Set(reports.map(r => r.organizationName))];
    });

    // Refrescar vista al cambiar idioma
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.store.loadReports();
  }

  filterByOrganization(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedOrganization = target.value;
    const reports = this.store.reports();
    this.filteredReports = this.selectedOrganization
      ? reports.filter(r => r.organizationName === this.selectedOrganization)
      : reports;
  }

  generate(report: Report): void {
    this.store.generateReport(report.id);
  }

  reload(): void {
    this.store.loadReports();
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }
}
