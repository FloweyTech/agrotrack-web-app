import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportStore } from '../../../application/report.store';
import { Report } from '../../../domain/model/report.entity';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './report-detail.html',
  styleUrls: ['./report-detail.css']
})
export class ReportDetailComponent implements OnInit, OnDestroy {
  report: Report | undefined;
  private langSub: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public store: ReportStore,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.report = this.store.reports().find((r) => r.id === id);

    // Refrescar vista al cambiar idioma
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  downloadExcel(): void {
    alert('Simulating Excel download for report ID: ' + this.report?.id);
  }

  goBack(): void {
    this.router.navigate(['/report']);
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }
}
