import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { ReportStatus } from './report-status.entity';
import { ReportType } from './report-type.enum';

/**
 * Class: Report
 * Represents a report entity with its properties and lifecycle methods.
 */

export class Report implements BaseEntity {
  id: number;
  requestedBy: number | null;
  plotId: number | null;
  organizationId: number;
  organizationName: string;
  type: ReportType;
  status: ReportStatus;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date | null;
  generate: boolean;

  /**
   * Initializes a new instance of the Report class.
   */
  constructor(props: {
    id: number;
    requestedBy?: number | null;
    plotId?: number | null;
    organizationId: number;
    organizationName: string;
    type: ReportType;
    status?: ReportStatus;
    periodStart: Date;
    periodEnd: Date;
    generatedAt?: Date | null;
    generate?: boolean;
  }) {
    this.id = props.id;
    this.requestedBy = props.requestedBy ?? null;
    this.plotId = props.plotId ?? null;
    this.organizationId = props.organizationId;
    this.organizationName = props.organizationName;
    this.type = props.type;
    this.status = props.status ?? ReportStatus.REQUESTED;
    this.periodStart = props.periodStart;
    this.periodEnd = props.periodEnd;
    this.generatedAt = props.generatedAt ?? null;
    this.generate = props.generate ?? false;
  }
  /**
   * Sets the report status to REQUESTED and marks it as not generated.
   */
  request(): void {
    this.status = ReportStatus.REQUESTED;
    this.generate = false;
  }
  /**
   * Sets the report status to PROCESSING.
   */
  startProcessing(): void {
    this.status = ReportStatus.PROCESSING;
  }
  /**
   * Marks the report as GENERATED, sets the generated date, and marks it as generated.
   */
  markGenerated(date: Date): void {
    this.status = ReportStatus.GENERATED;
    this.generate = true;
    this.generatedAt = date;
  }
  /**
   * Marks the report as FAILED, logs the reason, and marks it as not generated.
   */
  markFailed(reason: string): void {
    console.error(`Report generation failed: ${reason}`);
    this.status = ReportStatus.FAILED;
    this.generate = false;
  }
}
