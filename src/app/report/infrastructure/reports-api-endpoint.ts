import { HttpClient } from "@angular/common/http";
import { BaseApiEndpoint } from "../../shared/infrastructure/base-api-endpoint";
import { Report } from "../domain/model/report.entity";
import { ReportAssembler } from "./report-assembler";
import { ReportResource } from "./report-resource";
import { ReportsResponse } from "./reports-response";
import { environment } from "../../../environments/environment.development";

/**
 * ReportsApiEndpoint
 * REST API endpoint for the Report context.
 */
export class ReportsApiEndpoint extends BaseApiEndpoint<
  Report,
  ReportResource,
  ReportsResponse,
  ReportAssembler
> {
  constructor(http: HttpClient) {
    // Usa la misma convención que tus otros endpoints: base + /reports
    super(http, `${environment.platformProviderApiBaseUrl}/reports`, new ReportAssembler());
  }
}
