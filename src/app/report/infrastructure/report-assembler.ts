import { BaseAssembler } from "../../shared/infrastructure/base-assembler";
import { ReportStatus } from "../domain/model/report-status.entity";
import { ReportType } from "../domain/model/report-type.enum";
import { Report } from "../domain/model/report.entity";
import { ReportResource } from "./report-resource";
import { ReportsResponse } from "./reports-response";

/**
 * ReportAssembler
 * Convierte entre entidades del dominio (Report)
 * y recursos de infraestructura (ReportResource / ReportsResponse).
 */
export class ReportAssembler implements BaseAssembler<Report, ReportResource, ReportsResponse> {

  /**
   * Convierte un recurso JSON en una entidad de dominio.
   */
  toEntityFromResource(resource: ReportResource): Report {
    return new Report({
      id: resource.id,
      organizationId: resource.organizationId,
      organizationName: resource.organizationName,
      type: resource.reportType as ReportType,
      status: resource.reportStatus as ReportStatus,
      periodStart: new Date(resource.periodStart),
      periodEnd: new Date(resource.periodEnd),
      generate: resource.generate
    });
  }

  /**
   * Convierte una entidad de dominio a un recurso JSON listo para envío.
   */
  toResourceFromEntity(entity: Report): ReportResource {
    return {
      id: entity.id,
      organizationId: entity.organizationId,
      organizationName: entity.organizationName,
      reportType: entity.type,
      reportStatus: entity.status,
      periodStart: entity.periodStart.toISOString(),
      periodEnd: entity.periodEnd.toISOString(),
      generate: entity.generate
    };
  }

  /**
   * Convierte una respuesta del API con múltiples reportes a entidades.
   */
  toEntitiesFromResponse(response: ReportsResponse): Report[] {
    return response.reports.map(r => this.toEntityFromResource(r));
  }
}