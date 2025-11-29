import { Injectable } from "@angular/core";
import { BaseApi } from "../../shared/infrastructure/base-api";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Report } from "../domain/model/report.entity";
import {ReportAssembler} from './report-assembler';
import {ReportEndpoint} from './report-endpoint';
import {CreateReportCommand} from '../domain/model/create-report.command';
import {map} from 'rxjs/operators';

/**
 * API service for Reports operations.
 * Acts as a facade over the endpoints and assemblers.
 * @author FloweyTech developer team
 */
@Injectable({ providedIn: 'root' })
export class ReportApi extends BaseApi {
  private endpoint: ReportEndpoint;
  private assembler: ReportAssembler;

  constructor(http: HttpClient) {
    super();
    this.assembler = new ReportAssembler();
    this.endpoint = new ReportEndpoint(http, this.assembler);
  }

  /**
   * Creates a new report.
   * @param command - The creation command.
   * @returns An Observable of the created Report entity.
   */
  create(command: CreateReportCommand): Observable<Report> {
    return this.endpoint.createReport(command).pipe(
      map(resource => this.assembler.toEntityFromResource(resource))
    );
  }

  /**
   * Retrieves a report by ID.
   * @param id - The report ID.
   * @returns An Observable of the Report entity.
   */
  getById(id: number): Observable<Report> {
    return this.endpoint.getReportById(id).pipe(
      map(resource => this.assembler.toEntityFromResource(resource))
    );
  }
}
