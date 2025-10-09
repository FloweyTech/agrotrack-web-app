/**
 * DTO/Resource: ReportResource
 * Represents a report as delivered by the API or json-server.
 */
export interface ReportResource {
  id: number;
  organizationId: number;
  organizationName: string;
  reportType: string;
  reportStatus: string;
  periodStart: string;
  periodEnd: string;
  generate: boolean;
}
