import {Injectable} from '@angular/core';
import {ErrorHandlingEnabledBaseType} from '../../shared/infrastructure/error-handling-enabled-base-type';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {ReportAssembler} from './report-assembler';
import {CreateReportCommand} from '../domain/model/create-report.command';
import { Observable, catchError, map } from 'rxjs';
import {ReportResource} from './report-resource';


/**
 * API endpoint for handling report operations in the infrastructure layer.
 * @author FloweyTech developer team
 */
@Injectable({
  providedIn: 'root'
})
export class ReportEndpoint extends ErrorHandlingEnabledBaseType {
  private baseUrl = `${environment.platformProviderApiBaseUrl}`; // e.g. /api/v1

  constructor(
    private http: HttpClient,
    private assembler: ReportAssembler
  ) {
    super();
  }

  /**
   * Sends a POST request to create a new report.
   * @param command - The command containing path params and body data.
   * @returns An Observable of the created ReportResource.
   */
  createReport(command: CreateReportCommand): Observable<ReportResource> {
    // Construct dynamic URL: /organizations/{orgId}/plots/{plotId}/reports
    const url = `${this.baseUrl}/organizations/${command.organizationId}/plots/${command.plotId}/reports`;

    const requestBody = this.assembler.toRequestFromCommand(command);

    return this.http.post<ReportResource>(url, requestBody).pipe(
      map(resource => resource), // No conversion needed here, handled in API facade or Store
      catchError(this.handleError('Failed to create report'))
    );
  }

  /**
   * Gets a specific report by ID.
   * @param id - The report ID.
   * @returns An Observable of the ReportResource.
   */
  getReportById(id: number): Observable<ReportResource> {
    const url = `${this.baseUrl}/reports/${id}`;
    return this.http.get<ReportResource>(url).pipe(
      catchError(this.handleError('Failed to fetch report'))
    );
  }

}
