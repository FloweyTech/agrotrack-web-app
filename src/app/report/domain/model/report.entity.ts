import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { ReportStatus } from './report-status.entity';
import { ReportType } from './report-type.enum';

/**
 * Represents a Report entity in the domain layer.
 * @remarks
 * Matches the structure returned by the backend, including metrics.
 * @author FloweyTech developer team
 */

export class Report implements BaseEntity {
  private _id: number;
  private _status: string; // O ReportStatus si el backend devuelve strings exactos
  private _plotId: number;
  private _organizationId: number;
  private _type: string;
  private _metricType: string;
  private _periodStart: Date;
  private _periodEnd: Date;
  private _generatedAt: Date | null;
  // Puedes agregar un objeto para metrics si lo deseas, por ahora lo simplifico
  // private _metrics: any;

  /**
   * Initializes a new instance of the Report class.
   * @param props - The properties to initialize the report.
   */
  constructor(props: {
    id: number;
    status: string;
    plotId: number;
    organizationId: number;
    type: string;
    metricType: string;
    periodStart: Date;
    periodEnd: Date;
    generatedAt?: Date | null;
  }) {
    this._id = props.id;
    this._status = props.status;
    this._plotId = props.plotId;
    this._organizationId = props.organizationId;
    this._type = props.type;
    this._metricType = props.metricType;
    this._periodStart = props.periodStart;
    this._periodEnd = props.periodEnd;
    this._generatedAt = props.generatedAt || null;
  }

  get id(): number { return this._id; }
  get status(): string { return this._status; }
  get plotId(): number { return this._plotId; }
  get organizationId(): number { return this._organizationId; }
  get type(): string { return this._type; }
  get metricType(): string { return this._metricType; }
  get periodStart(): Date { return this._periodStart; }
  get periodEnd(): Date { return this._periodEnd; }
  get generatedAt(): Date | null { return this._generatedAt; }
}
