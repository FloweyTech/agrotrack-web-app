import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { UserStatus } from './user-status.enum';
import { UserRole } from './user.role.enum';

export class User implements BaseEntity {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;

  constructor(props: {
    id: number;
    email: string;
    passwordHash: string;
    role: UserRole;
    status?: UserStatus;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.status = props.status ?? UserStatus.ACTIVE;
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
