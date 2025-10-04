
import {Subscription} from 'rxjs';
import {BaseEntity} from '../../../shared/infrastructure/base-entity';

/**
 * Represents an Organization entity in the application.
 * @remarks
 * This class is used as a domain model for categories in the learning context.
 * It implements the BaseEntity interface to ensure consistency across entities.
 * @see {@link BaseEntity}
 */

export class Organization implements BaseEntity {
  /**
   * The unique identifier of the organization.
   */
  private _id: number;

  /**
   * The name of the organization.
   */
  private _name: string;


  private _members: Array<number>;

  private _status: OrganizationStatus;

  private _maxPlots: number;

  private _subscription : Subscription;


  /**
   * Creates an instance of the Organization entity.
   * @paran organization - an object containing the properties of the organization.
   * @returns A new instance of Organization.
   */
  constructor(organization: {
    id: number;
    name: string;
    members: Array<number>;
    status: OrganizationStatus;
    maxPlots: number;
    subscription : Subscription;
    }) {

    this._id = organization.id;
    this._name = organization.name;
    this._members = organization.members;
    this._status = organization.status;
    this._maxPlots = organization.maxPlots;
    this._subscription = organization.subscription;
  }


  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }


  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }


}

enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
