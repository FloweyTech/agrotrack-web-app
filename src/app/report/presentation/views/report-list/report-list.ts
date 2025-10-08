import { Component, OnInit, effect } from '@angular/core';
import { ReportStore } from '../../../application/report.store';
import { Report } from '../../../domain/model/report.entity';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatSelectModule, 
    MatFormFieldModule, 
    RouterModule
  ],
  templateUrl: './report-list.html',
  styleUrls: ['./report-list.css']
})
export class ReportListComponent implements OnInit {
  displayedColumns = ['id', 'organizationName', 'type', 'status', 'period', 'actions'];
  organizations: string[] = [];
  filteredReports: Report[] = [];
  selectedOrganization: string = '';

  constructor(public store: ReportStore) {
    effect(() => {
      const reports = this.store.reports();
      this.filteredReports = this.selectedOrganization
        ? reports.filter(r => r.organizationName === this.selectedOrganization)
        : reports;
      this.organizations = [...new Set(reports.map(r => r.organizationName))];
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
}

