import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { UserStatus } from './user-status.enum';
import { UserRole } from './user.role.enum';

export class User implements BaseEntity {
  id: number;
  email: string;
  username?: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  token?: string;

  constructor(props: {
    id: number;
    email: string;
    username?: string;
    passwordHash: string;
    role: UserRole;
    status?: UserStatus;
    token?: string;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.username = props.username;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.status = props.status ?? UserStatus.ACTIVE;
    this.token = props.token;
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
