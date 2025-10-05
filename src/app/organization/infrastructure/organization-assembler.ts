import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Organization} from '../domain/model/organization.entity';
import {OrganizationResource, OrganizationsResponse} from './organizations-response';
import {resource} from '@angular/core';

/**
 * Assembler for converting between Organization entities, OrganizationResource, resources and OrganizationResponse
 */
export class OrganizationAssembler implements BaseAssembler<Organization, OrganizationResource, OrganizationsResponse>{
  /**
   * Converts a OrganizationResponse to an array of Organization entities.
   * @param response - The API response containing organization.
   * @return An array of Organization entities.
   */
  toEntitiesFromResponse(response: OrganizationsResponse): Organization[] {
    return response.organizations.map(resource =>
    this.toEntityFromResource(resource as OrganizationResource));
  }

  /**
   * Converts a OrganizationResource to an Organization entity.
   * @param resource - The resource to convert.
   * @return The converted Organization entity.
   */
  toEntityFromResource(resource: OrganizationResource): Organization {
    return new Organization({
      id: resource.id,
      name: resource.name,
      members: resource.members,
      status: resource.status,
      subscription: resource.subscription
    });
  }

  /**
   * Converts a Organization entity to a OrganizationResource.
   * @param entity - The Organization entity to convert.
   * @return The converted OrganizationResource.
   */
  toResourceFromEntity(entity: Organization): OrganizationResource {
    return {
      id: entity.id,
      name: entity.name,
      members: entity.members,
      status: entity.status,
      subscription: entity.subscription
    } as OrganizationResource;
  }
}
