import { Injectable, computed, signal } from '@angular/core';
import { MonitoringApiEndpoint } from '../infrastructure/monitoring-api-endpoint';
import { TaskApiEndpoint } from '../infrastructure/task-api-endpoint';
import { WeatherApiEndpoint } from '../infrastructure/weather-api-endpoint';
import { EnvironmentalReading, ReadingType } from '../domain/model/environmental-reading.entity';
import { Task } from '../domain/model/task.entity';
import { Weather } from '../domain/model/weather.entity';
import { retry, forkJoin, map, switchMap, of } from 'rxjs';

/**
 * Store for managing environmental readings, tasks, and simulated IoT alerts.
 */
@Injectable({
  providedIn: 'root'
})
export class MonitoringStore {
  // --- Signals ---
  private readonly readingsSignal = signal<EnvironmentalReading[]>([]);
  readonly readings = this.readingsSignal.asReadonly();

  private readonly tasksSignal = signal<Task[]>([]);
  readonly tasks = this.tasksSignal.asReadonly();

  private readonly alertsSignal = signal<string[]>([]);
  readonly alerts = this.alertsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  private readonly weatherSignal = signal<Weather | null>(null);
  readonly weather = this.weatherSignal.asReadonly();

  private readonly weatherLoadingSignal = signal<boolean>(false);
  readonly weatherLoading = this.weatherLoadingSignal.asReadonly();

  // --- Computed values ---
  readonly readingCount = computed(() => this.readings().length);
  readonly taskCount = computed(() => this.tasks().length);

  constructor(
    private monitoringApi: MonitoringApiEndpoint,
    private weatherApi: WeatherApiEndpoint,
    private taskApi: TaskApiEndpoint
  ) {}

  /**
   * Loads all environmental readings from all plots.
   */
  loadAllReadings(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.monitoringApi.getAllReadings().subscribe({
      next: (readings) => {
        console.log('Loaded all readings:', readings);
        this.readingsSignal.set(readings);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading all readings:', err);
        this.errorSignal.set(this.formatError(err, 'Failed to load all readings'));
        this.loadingSignal.set(false);
      }
    });
  }


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
        console.error('Error loading readings for plot', plotId, ':', err);
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
   * TODO: Pasarlo al backend
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
   * Loads current weather data for a specific location.
   * @param location - Optional location query (defaults to environment location).
   */
  loadCurrentWeather(location?: string): void {
    this.weatherLoadingSignal.set(true);

    this.weatherApi.getCurrentWeather(location).pipe(retry(2)).subscribe({
      next: (weather) => {
        console.log('Loaded weather data:', weather);
        this.weatherSignal.set(weather);
        this.weatherLoadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading weather:', err);
        this.weatherSignal.set(null);
        this.weatherLoadingSignal.set(false);
      }
    });
  }

  /**
   * Loads tasks assigned to a profile (for FARMER role)
   */
  loadTasksAssignedTo(assignedToProfileId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.getTasksAssignedTo(assignedToProfileId).pipe(
      switchMap((tasks) => {
        if (tasks.length === 0) {
          return of(tasks);
        }
        // Get unique organization IDs
        const orgIds = [...new Set(tasks.map(t => t.organizationId))];
        // Fetch all organization names in parallel
        const orgRequests = orgIds.map(id =>
          this.taskApi.getOrganizationName(id).pipe(
            map(name => ({ id, name }))
          )
        );
        return forkJoin(orgRequests).pipe(
          map(orgNames => {
            const orgMap = new Map(orgNames.map(o => [o.id, o.name]));
            // Enrich tasks with organization names
            return tasks.map(task => ({
              ...task,
              organizationName: orgMap.get(task.organizationId)
            }));
          })
        );
      })
    ).subscribe({
      next: (tasks) => {
        this.tasksSignal.set(tasks);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to load assigned tasks'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads tasks created by a profile (for AGRONOMIST role)
   */
  loadTasksByAssignee(assigneeProfileId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.getTasksByAssignee(assigneeProfileId).pipe(
      switchMap((tasks) => {
        if (tasks.length === 0) {
          return of(tasks);
        }
        // Get unique organization IDs
        const orgIds = [...new Set(tasks.map(t => t.organizationId))];
        // Fetch all organization names in parallel
        const orgRequests = orgIds.map(id =>
          this.taskApi.getOrganizationName(id).pipe(
            map(name => ({ id, name }))
          )
        );
        return forkJoin(orgRequests).pipe(
          map(orgNames => {
            const orgMap = new Map(orgNames.map(o => [o.id, o.name]));
            // Enrich tasks with organization names
            return tasks.map(task => ({
              ...task,
              organizationName: orgMap.get(task.organizationId)
            }));
          })
        );
      })
    ).subscribe({
      next: (tasks) => {
        this.tasksSignal.set(tasks);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to load tasks'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Creates a new task
   */
  createTask(task: Task): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.createTask(task).pipe(retry(2)).subscribe({
      next: (created) => {
        this.tasksSignal.update((tasks) => [...tasks, created]);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to create task'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Cancel a task (change status to CANCELLED)
   */
  cancelTask(taskId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.cancelTask(taskId).pipe(retry(2)).subscribe({
      next: () => {
        this.tasksSignal.update((tasks) =>
          tasks.map(task =>
            task.taskId === taskId ? { ...task, taskStatus: 'CANCELLED' } : task
          )
        );
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to cancel task'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Mark task as in progress
   */
  markInProgress(taskId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.markInProgress(taskId).pipe(retry(2)).subscribe({
      next: () => {
        this.tasksSignal.update((tasks) =>
          tasks.map(task =>
            task.taskId === taskId ? { ...task, taskStatus: 'IN_PROGRESS' } : task
          )
        );
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to mark task in progress'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Mark task as completed
   */
  markCompleted(taskId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.markCompleted(taskId).pipe(retry(2)).subscribe({
      next: () => {
        this.tasksSignal.update((tasks) =>
          tasks.map(task =>
            task.taskId === taskId ? { ...task, taskStatus: 'COMPLETED' } : task
          )
        );
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to mark task as completed'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Delete a task
   */
  deleteTask(taskId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.taskApi.deleteTask(taskId).pipe(retry(2)).subscribe({
      next: () => {
        this.tasksSignal.update((tasks) =>
          tasks.filter(task => task.taskId !== taskId)
        );
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete task'));
        this.loadingSignal.set(false);
      }
    });
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
