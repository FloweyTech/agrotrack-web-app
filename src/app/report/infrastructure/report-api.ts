import { Injectable } from "@angular/core";
import { BaseApi } from "../../shared/infrastructure/base-api";
import { ReportsApiEndpoint } from "./reports-api-endpoint";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Report } from "../domain/model/report.entity";

@Injectable({ providedIn: 'root' })
export class ReportApi extends BaseApi {
  private readonly reportsEndpoint: ReportsApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.reportsEndpoint = new ReportsApiEndpoint(http);
  }

  getReports(): Observable<Report[]> {
    return this.reportsEndpoint.getAll();
  }

  getReport(id: number): Observable<Report> {
    return this.reportsEndpoint.getById(id);
  }

  createReport(report: Report): Observable<Report> {
    return this.reportsEndpoint.create(report);
  }

  updateReport(report: Report): Observable<Report> {
    return this.reportsEndpoint.update(report, report.id);
  }

  deleteReport(id: number): Observable<void> {
    return this.reportsEndpoint.delete(id);
  }
}
