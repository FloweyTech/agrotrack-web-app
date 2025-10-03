import { BaseEntity} from '../../../shared/infrastructure/base-entity';

/**
 * Represents an Organization entity in the application.
 * @remarks
 * This class is used as a domain model for categories in the learning context.
 * It implements the BaseEntity interface to ensure consistency across entities.
 * @see {@link BaseEntity}
 */

export class Organization {
  /**
   * Creates an instance of the Organization entity.
   * @paran organization - an object containing the properties of the organization.
   * @returns A new instance of Organization.
   */
  constructor(organization: {id: number; name: string; }) {
    this._id = organization.id;
    this._name = organization.name;
  }

  /**
   * The unique identifier of the organization.
   */
  private _id: number;

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  /**
   * The name of the organization.
   */
  private _name: String;

  get name(): String {
    return this._name;
  }

  set name(value: String) {
    this._name = value;
  }
}
