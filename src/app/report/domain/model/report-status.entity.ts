/**
 * Enum: ReportStatus
 * Define los estados posibles del ciclo de vida de un Report.
 */
export enum ReportStatus {
  REQUESTED = 'REQUESTED',
  PROCESSING = 'PROCESSING',
  GENERATED = 'GENERATED',
  FAILED = 'FAILED'
}
