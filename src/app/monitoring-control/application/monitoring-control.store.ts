import { Injectable, computed, signal, Signal } from '@angular/core';
import { MonitoringApiEndpoint } from '../infrastructure/monitoring-api-endpoint';
import { EnvironmentalReading, ReadingType } from '../domain/model/environmental-reading.entity';
import { retry } from 'rxjs';

/**
 * Store for managing environmental readings and simulated IoT alerts.
 */
@Injectable({
  providedIn: 'root'
})
export class MonitoringStore {
  // --- Signals ---
  private readonly readingsSignal = signal<EnvironmentalReading[]>([]);
  readonly readings = this.readingsSignal.asReadonly();

  private readonly alertsSignal = signal<string[]>([]);
  readonly alerts = this.alertsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  // --- Computed values ---
  readonly readingCount = computed(() => this.readings().length);

  constructor(private monitoringApi: MonitoringApiEndpoint) {}

  /**
   * Loads all readings for a specific plot.
   * @param plotId The ID of the plot whose readings should be retrieved.
   */
  loadReadingsByPlotId(plotId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.monitoringApi.getReadingsByPlotId(plotId).subscribe({
      next: (readings) => {
        // Remove old readings for this plot and add new ones
        const currentReadings = this.readingsSignal();
        const filteredReadings = currentReadings.filter(r => r.plotId !== plotId);
        this.readingsSignal.set([...filteredReadings, ...readings]);
        
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to load readings'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Creates a new environmental reading and evaluates if it triggers an alert.
   * @param reading The reading to be added.
   */
  addReading(reading: EnvironmentalReading): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.monitoringApi.createReading(reading).pipe(retry(2)).subscribe({
      next: (created) => {
        this.readingsSignal.update((r) => [...r, created]);
        this.loadingSignal.set(false);

        // Evaluate alert after creation
        const alertMsg = this.evaluate(created);
        if (alertMsg) {
          this.alertsSignal.update((alerts) => [...alerts, alertMsg]);
          console.warn('⚠️ ALERT:', alertMsg);
        }
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to add reading'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Evaluates a reading to determine if it is outside safe thresholds.
   * @param reading The EnvironmentalReading to evaluate.
   * @returns A string message if an alert is triggered, otherwise null.
   */
  private evaluate(reading: EnvironmentalReading): string | null {
    switch (reading.type) {
      case ReadingType.TEMPERATURE:
        if (reading.value < 10 || reading.value > 35) {
          return `Temperature alert for Plot ${reading.plotId}: ${reading.value}°${reading.unit}`;
        }
        break;

      case ReadingType.HUMIDITY:
        if (reading.value < 40 || reading.value > 80) {
          return `Humidity alert for Plot ${reading.plotId}: ${reading.value}${reading.unit}`;
        }
        break;

      case ReadingType.PH_LEVEL:
        if (reading.value < 5.5 || reading.value > 7.5) {
          return `pH alert for Plot ${reading.plotId}: ${reading.value}`;
        }
        break;
    }
    return null;
  }

  /**
   * Clears all alerts manually.
   */
  clearAlerts(): void {
    this.alertsSignal.set([]);
  }

  /**
   * Formats an error message for user-friendly display.
   * @param error The error object.
   * @param fallback The fallback error message.
   * @returns A formatted string describing the error.
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }
    return fallback;
  }
}
