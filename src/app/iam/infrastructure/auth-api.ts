import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../domain/model/user.entity';
import { UserAssembler } from './user-assembler';
import { UserResource } from './user-resource';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly assembler = new UserAssembler();
  private readonly baseUrl = `${environment.platformProviderApiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<User | null> {
    const url = `${this.baseUrl}?email=${email}&passwordHash=${password}`;
    return this.http.get<UserResource[]>(url).pipe(
      map((res) => (res.length > 0 ? this.assembler.toEntityFromResource(res[0]) : null))
    );
  }

  register(user: User): Observable<User> {
    const resource = this.assembler.toResourceFromEntity(user);
    return this.http.post<UserResource>(this.baseUrl, resource).pipe(
      map((res) => this.assembler.toEntityFromResource(res))
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<UserResource[]>(this.baseUrl).pipe(
      map((resources) => resources.map(res => this.assembler.toEntityFromResource(res)))
    );
  }
}
