import { HttpClient } from "@angular/common/http";
import { BaseApiEndpoint } from "../../shared/infrastructure/base-api-endpoint";
import { Report } from "../domain/model/report.entity";
import { ReportAssembler } from "./report-assembler";
import { ReportResource } from "./report-resource";
import { ReportsResponse } from "./reports-response";
import { environment } from "../../../environments/environment";

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
    // Usa la configuración del environment como los demás endpoints
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderReportsEndpointPath}`, new ReportAssembler());
  }
}
