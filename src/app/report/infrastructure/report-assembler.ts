import { BaseAssembler } from "../../shared/infrastructure/base-assembler";
import { ReportStatus } from "../domain/model/report-status.entity";
import { ReportType } from "../domain/model/report-type.enum";
import { Report } from "../domain/model/report.entity";
import { ReportResource } from "./report-resource";
import { ReportsResponse } from "./reports-response";

/**
 * ReportAssembler
 * Converts between domain entities (Report)
 * and infrastructure resources (ReportResource / ReportsResponse).
 */
export class ReportAssembler implements BaseAssembler<Report, ReportResource, ReportsResponse> {

  /**
   * Converts a JSON resource into a domain entity.
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
   * Converts a domain entity into a JSON resource ready for sending.
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
   * Converts an API response with multiple reports into domain entities.
   */
  toEntitiesFromResponse(response: ReportsResponse): Report[] {
    return response.reports.map(r => this.toEntityFromResource(r));
  }
}
