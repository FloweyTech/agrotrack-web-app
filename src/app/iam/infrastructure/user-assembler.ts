import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { User } from '../domain/model/user.entity';
import { UserResource } from './user-resource';
import { UserStatus } from '../domain/model/user-status.enum';
import { UserRole } from '../domain/model/user.role.enum';

export class UserAssembler implements BaseAssembler<User, UserResource, UserResource[]> {
  toEntityFromResource(r: UserResource): User {
    return new User({
      id: r.id,
      email: r.email,
      passwordHash: r.passwordHash,
      role: r.role as UserRole,
      status: r.status as UserStatus,
      name: r.name,
      avatarUrl: r.avatarUrl,
    });
  }
  toResourceFromEntity(e: User): UserResource {
    return {
      id: e.id,
      email: e.email,
      passwordHash: e.passwordHash,
      role: e.role,
      status: e.status,
      name: e.name,
      avatarUrl: e.avatarUrl,
    };
  }

  toEntitiesFromResponse(response: UserResource[]): User[] {
    return response.map((r) => this.toEntityFromResource(r));
  }
}
