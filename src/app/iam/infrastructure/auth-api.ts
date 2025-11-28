import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../domain/model/user.entity';
import { UserAssembler } from './user-assembler';
import { UserResource } from './user-resource';
import { SignInRequest } from './sign-in-request';
import { SignInResponse } from './sign-in-response';
import { SignUpRequest } from './sign-up-request';
import { SignUpResponse } from './sign-up-response';
import { ProfileResponse } from './profile-response';
import { environment } from '../../../environments/environment';
import { UserRole } from '../domain/model/user.role.enum';
import { UserStatus } from '../domain/model/user-status.enum';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly assembler = new UserAssembler();
  private readonly baseUrl = `${environment.platformProviderApiBaseUrl}`;

  constructor(private http: HttpClient) {}

  login(identifier: string, password: string): Observable<User | null> {
    const url = `${this.baseUrl}/api/v1/authentication/sign-in`;
    const request: SignInRequest = { identifier, password };
    
    return this.http.post<SignInResponse>(url, request).pipe(
      map((response) => {
        return new User({
          id: response.id,
          username: response.username,
          email: identifier,
          passwordHash: '',
          role: response.role as UserRole,
          status: UserStatus.ACTIVE,
          token: response.token
        });
      })
    );
  }

  register(username: string, email: string, password: string, role: UserRole, firstName: string, lastName: string, photoUrl: string = ''): Observable<User> {
    const url = `${this.baseUrl}/api/v1/authentication/sign-up`;
    const request: SignUpRequest = {
      username,
      email,
      password,
      role,
      firstName,
      lastName,
      photoUrl
    };
    
    return this.http.post<SignUpResponse>(url, request).pipe(
      map((response) => {
        return new User({
          id: response.id,
          username: response.username,
          email: response.email,
          passwordHash: '',
          role: response.role as UserRole,
          status: UserStatus.ACTIVE
        });
      })
    );
  }

  getProfileByUserId(userId: number): Observable<number> {
    const url = `${this.baseUrl}/api/v1/profiles/user/${userId}`;
    return this.http.get<ProfileResponse>(url).pipe(
      map((response) => response.profileId)
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<UserResource[]>(this.baseUrl).pipe(
      map((resources) => resources.map(res => this.assembler.toEntityFromResource(res)))
    );
  }
}
