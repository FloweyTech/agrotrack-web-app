import {Injectable} from '@angular/core';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {OrganizationsApiEndpoint} from './organizations-api-endpoint';
import {SubscriptionsApiEndpoint} from './subscriptions-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Organization} from '../domain/model/organization.entity';
import {Subscription} from '../domain/model/subscription.entity';

/**
 * API service for managing endpoints in the learning context (organizations, subscriptions plots and plantTypes).
 */
@Injectable({providedIn: 'root'})
export class OrganizationApi extends BaseApi{
  private readonly organizationsEndpoint: OrganizationsApiEndpoint;
  private readonly subscriptionsEndpoint: SubscriptionsApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.organizationsEndpoint = new OrganizationsApiEndpoint(http);
    this.subscriptionsEndpoint = new SubscriptionsApiEndpoint(http);
  }

  /**
   * Retrieves all organizations from the API.
   * @returns An Observable for an array of Organization objects.
   */
  getOrganizations(): Observable<Organization[]>{
    return this.organizationsEndpoint.getAll();
  }

  /**
   * Retrieves a single organization by ID.
   * @param id - The ID of the organization.
   * @returns An Observable of the Organization object.
   */
  getOrganization(id: number): Observable<Organization>{
    return this.organizationsEndpoint.getById(id);
  }

  /**
   * Creates a new organization.
   * @param organization - The organization to create.
   * @returns An Observable of the created Organization object.
   */
  createOrganization(organization: Organization): Observable<Organization>{
    return this.organizationsEndpoint.create(organization);
  }

  /**
   * Updates an existing organization.
   * @param organization - The organization to update.
   * @returns An Observable of the updated Organization object.
   */
  updateOrganization(organization: Organization): Observable<Organization>{
    return this.organizationsEndpoint.update(organization,organization.id);
  }

  /**
   * Deletes an organization by ID.
   * @param id - The ID of the organization to delete.
   * @returns An Observable of void.
   */
  deleteOrganization(id: number): Observable<void>{
    return this.organizationsEndpoint.delete(id);
  }


  /**
   * Retrieves all subscriptions from the API.
   * @returns An Observable for an array of Subscription objects.
   */
  getSubscriptions():Observable<Subscription[]>{
    return this.subscriptionsEndpoint.getAll();
  }

  /**
   * Retrieves a single subscription by ID.
   * @param id - The ID of the subscription.
   * @returns An Observable of the Subscription object.
   */
  getSubscription(id: number): Observable<Subscription>{
    return this.subscriptionsEndpoint.getById(id);
  }

  /**
   * Creates a new subscription.
   * @param subscription - The subscription to create.
   * @returns An Observable of the created Subscription object.
   */
  createSubscription(subscription: Subscription): Observable<Subscription>{
    return this.subscriptionsEndpoint.create(subscription);
  }

  /**
   * Updates an existing subscription.
   * @param subscription - The subscription to update.
   * @returns An Observable of the updated Subscription object.
   */
  updateSubscription(subscription: Subscription): Observable<Subscription>{
    return this.subscriptionsEndpoint.update(subscription,subscription.id);
  }

  /**
   * Deletes a subscription by ID.
   * @param id - The ID of the subscription to delete.
   * @returns An Observable of void.
   */
  deleteSubscription(id: number): Observable<void>{
    return this.subscriptionsEndpoint.delete(id);
  }

}
