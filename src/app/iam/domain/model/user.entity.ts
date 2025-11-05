import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { UserStatus } from './user-status.enum';
import { UserRole } from './user.role.enum';

export class User implements BaseEntity {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  name?: string;
  avatarUrl?: string;

  constructor(props: {
    id: number;
    email: string;
    passwordHash: string;
    role: UserRole;
    status?: UserStatus;
    name?: string;          // <-- nuevo
    avatarUrl?: string;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.status = props.status ?? UserStatus.ACTIVE;
    this.name = props.name;
    this.avatarUrl = props.avatarUrl;
  }

  matchCredentials(email: string, password: string): boolean {
    return this.email === email && this.passwordHash === password;
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  isAgronomist(): boolean {
    return this.role === UserRole.AGRONOMIST;
  }

  isFarmer(): boolean {
    return this.role === UserRole.FARMER;
  }
}
