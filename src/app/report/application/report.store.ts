import { Injectable, computed, signal } from '@angular/core';
import { Report } from '../domain/model/report.entity';
import { ReportApi } from '../infrastructure/report-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';

/**
 * ReportStore
 * Administra el estado del contexto Report usando Angular Signals.
 */
@Injectable({ providedIn: 'root' })
export class ReportStore {
  // Signals de estado
  private readonly reportsSignal = signal<Report[]>([]);
  readonly reports = this.reportsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  // Derivados (computed)
  readonly reportCount = computed(() => this.reports().length);
  readonly generatedReports = computed(() => this.reports().filter(r => r.generate));

  constructor(private reportApi: ReportApi) {
    this.loadReports();
  }

  /**
   * Carga todos los reportes desde la API.
   */
  loadReports(): void {
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
}


  /**
   * Agrega un nuevo reporte.
   */
  addReport(report: Report): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.reportApi.createReport(report).pipe(retry(2)).subscribe({
      next: (created) => {
        this.reportsSignal.update((reports) => [...reports, created]);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Error al crear reporte'));
        this.loadingSignal.set(false);
      },
    });
  }

  /**
   * Actualiza un reporte existente.
   */
  updateReport(report: Report): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.reportApi.updateReport(report).pipe(retry(2)).subscribe({
      next: (updated) => {
        this.reportsSignal.update((reports) =>
          reports.map((r) => (r.id === updated.id ? updated : r))
        );
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Error al actualizar reporte'));
        this.loadingSignal.set(false);
      },
    });
  }

  /**
   * Elimina un reporte.
   */
  deleteReport(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.reportApi.deleteReport(id).pipe(retry(2)).subscribe({
      next: () => {
        this.reportsSignal.update((reports) => reports.filter((r) => r.id !== id));
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Error al eliminar reporte'));
        this.loadingSignal.set(false);
      },
    });
  }

  /**
   * Marca un reporte como "en generación" → luego simula actualización.
   */
  generateReport(id: number): void {
    const report = this.reports().find((r) => r.id === id);
    if (!report) return;

    report.startProcessing();
    this.updateReport(report);

    // Simulación (si aún no hay backend real)
    setTimeout(() => {
      report.markGenerated(new Date());
      this.updateReport(report);
    }, 2500);
  }

  /**
   * Formatea mensajes de error.
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return fallback;
  }
}
