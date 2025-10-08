/**
 * DTO/Resource: ReportResource
 * Representa un reporte tal como lo entrega el API o json-server.
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
