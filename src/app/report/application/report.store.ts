import { Injectable, computed, signal } from '@angular/core';
import { Report } from '../domain/model/report.entity';
import { ReportApi } from '../infrastructure/report-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';
import {CreateReportCommand} from '../domain/model/create-report.command';
import {Router} from '@angular/router';

/**
 * Application service store for managing Reports state.
 * @author FloweyTech developer team
 */
@Injectable({ providedIn: 'root' })
export class ReportStore {
  private readonly reportsSignal = signal<Report[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly reports = this.reportsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private reportApi: ReportApi) {}


  /**
   * Creates a new report via the API and updates the state.
   * @param command - The create report command.
   * @param router - Optional router for navigation after success.
   */
  createReport(command: CreateReportCommand, router?: Router): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.reportApi.create(command).subscribe({
      next: (newReport) => {
        this.reportsSignal.update(list => [...list, newReport]);
        this.loadingSignal.set(false);
        if (router) {
          // Navigate to detail or list
          router.navigate(['/reports', newReport.id]);
        }
      },
      error: (err) => {
        this.errorSignal.set(err.message || 'Error creating report');
        this.loadingSignal.set(false);
      }
    });
  }
  /**
   * Loads all reports from the API.
   */
  /*loadReports(): void {
  this.loadingSignal.set(true);
  this.errorSignal.set(null);

  this.reportApi.getReports().subscribe({
    next: (reports) => {
      this.reportsSignal.set(reports);
      this.loadingSignal.set(false);
    },
    error: (err) => {
      this.errorSignal.set(this.formatError(err, 'Error al cargar reportes'));
      this.loadingSignal.set(false);
    }
  });
   */

}

