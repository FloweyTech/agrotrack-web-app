import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportStore } from '../../../application/report.store';
import { Report } from '../../../domain/model/report.entity';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './report-detail.html',
  styleUrls: ['./report-detail.css']
})
export class ReportDetailComponent implements OnInit {
  report: Report | undefined;
  
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    public store: ReportStore
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.report = this.store.reports().find((r) => r.id === id);
  }

  downloadExcel(): void {
    alert('Simulating Excel download for report ID: ' + this.report?.id);
  }

  goBack(): void {
    this.router.navigate(['/report']);
  }
}
