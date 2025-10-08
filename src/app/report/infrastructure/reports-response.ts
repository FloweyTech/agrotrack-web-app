import { ReportResource } from "./report-resource";

/**
 * API Response: ReportsResponse
 * Representa una respuesta que contiene múltiples reportes.
 */
export interface ReportsResponse {
  reports: ReportResource[];
}