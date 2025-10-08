import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { User } from '../domain/model/user.entity';
import { UserResource } from './user-resource';
import { UserAssembler } from './user-assembler';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersApiEndpoint extends BaseApiEndpoint<
  User,
  UserResource,
  UserResource[],
  UserAssembler
> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}/users`, new UserAssembler());
  }
}
