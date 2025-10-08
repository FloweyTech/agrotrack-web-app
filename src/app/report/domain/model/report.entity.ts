import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { ReportStatus } from './report-status.entity';
import { ReportType } from './report-type.enum';

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

  request(): void {
    this.status = ReportStatus.REQUESTED;
    this.generate = false;
  }

  startProcessing(): void {
    this.status = ReportStatus.PROCESSING;
  }

  markGenerated(date: Date): void {
    this.status = ReportStatus.GENERATED;
    this.generate = true;
    this.generatedAt = date;
  }

  markFailed(reason: string): void {
    console.error(`Report generation failed: ${reason}`);
    this.status = ReportStatus.FAILED;
    this.generate = false;
  }
}
