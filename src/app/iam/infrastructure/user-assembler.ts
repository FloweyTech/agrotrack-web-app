import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { User } from '../domain/model/user.entity';
import { UserResource } from './user-resource';
import { UserStatus } from '../domain/model/user-status.enum';
import { UserRole } from '../domain/model/user.role.enum';

export class UserAssembler implements BaseAssembler<User, UserResource, UserResource[]> {
  toEntityFromResource(resource: UserResource): User {
    return new User({
      id: resource.id,
      email: resource.email,
      passwordHash: resource.passwordHash,
      role: resource.role as UserRole,
      status: resource.status as UserStatus,
    });
  }

  toResourceFromEntity(entity: User): UserResource {
    return {
      id: entity.id,
      email: entity.email,
      passwordHash: entity.passwordHash,
      role: entity.role,
      status: entity.status,
    };
  }

  toEntitiesFromResponse(response: UserResource[]): User[] {
    return response.map((r) => this.toEntityFromResource(r));
  }
}
