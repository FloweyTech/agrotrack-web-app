import {computed, inject, Injectable, signal} from '@angular/core';
import {SignInCommand} from '../domain/model/sign-in.command';
import {Router} from '@angular/router';
import {User} from '../domain/model/user.entity';
import {IamApi} from '../infrastructure/iam-api';
import {SignUpCommand} from '../domain/model/sign-up.command';
import {ProfileStore} from '../../profile/application/profile.store';
import {UserStatus} from '../domain/model/user-status.enum';
import {UserRole} from '../domain/model/user.role.enum';


/**
 * @summary Application service store for managing Identity and Access Management state.
 * @description Handles user authentication, sign-in, sign-up, and user data synchronization with the Profile context.
 * @author FloweyTech
 */
@Injectable({providedIn: 'root'})
export class IamStore {
  private readonly isSignedInSignal = signal<boolean>(false);
  private readonly currentUsernameSignal = signal<string | null>(null);
  private readonly currentUserIdSignal = signal<number | null>(null);
  private readonly usersSignal = signal<Array<User>>([]);
  private readonly currentRoleSignal = signal<string | null>(null);

  private profileStore = inject(ProfileStore);

  /**
   * Readonly signal indicating if the user is signed in.
   */
  readonly isSignedIn = this.isSignedInSignal.asReadonly();

  /**
   * Signal indicating if users are being loaded.
   */
  readonly loadingUsers = signal<boolean>(false);

  /**
   * Readonly signal for the current username.
   */
  readonly currentUsername = this.currentUsernameSignal.asReadonly();

  /**
   * Readonly signal for the current user ID.
   */
  readonly currentUserId = this.currentUserIdSignal.asReadonly();

  /**
   * @summary Readonly signal containing the current user's role (e.g., Farmer, Agronomist).
   */
  readonly currentRole = this.currentRoleSignal.asReadonly();

  /**
   * Computed signal for the current authentication token.
   */
  readonly currentToken = computed(() => this.isSignedIn() ? localStorage.getItem('token') : null);

  /**
   * Readonly signal for the list of users.
   */
  readonly users = this.usersSignal.asReadonly();

  /**
   * Readonly signal indicating if users are loading.
   */
  readonly isLoadingUsers = this.loadingUsers.asReadonly();

  /**
   * @summary Initializes the IamStore dependency.
   * @param iamApi The infrastructure service for IAM API communication.
   */
  constructor(private iamApi: IamApi) {
    this.isSignedInSignal.set(false);
    this.currentUsernameSignal.set(null);
    this.currentUserIdSignal.set(null);
    this.currentRoleSignal.set(null);
  }

  /**
   * @summary Signs in a user using the provided credentials.
   * @description Authenticates the user, updates the local state, hydrates the profile store, and navigates to the organization page.
   * @param signInCommand The command object containing the user's identifier and password.
   * @param router The Angular Router service used for navigation upon success or failure.
   */
  signIn(signInCommand: SignInCommand, router: Router) {
    console.log(signInCommand);
    this.iamApi.signIn(signInCommand).subscribe({
      next: (signInResource) => {
        localStorage.setItem('token', signInResource.token);
        localStorage.setItem('role', signInResource.role);

        this.isSignedInSignal.set(true);
        this.currentUsernameSignal.set(signInResource.username);
        this.currentUserIdSignal.set(signInResource.id);
        this.currentRoleSignal.set(signInResource.role);

        // 3. Hydrate Profile Context (Temporary logic until Profile API is fully integrated)
        const user = new User({
          id: signInResource.id,
          email: signInResource.username,
          passwordHash: '',
          role: signInResource.role as UserRole,
          status: UserStatus.ACTIVE
        });
        this.profileStore.hydrateFromUser(user);

        router.navigate(['/organization']).then();
      },
      error: (err) => {
        console.error('Sign-in failed:', err);
        this.isSignedInSignal.set(false);
        this.currentUsernameSignal.set(null);
        this.currentUserIdSignal.set(null);
        this.profileStore.reset();
        router.navigate(['/login']).then();
      }
    });
  }

  /**
   * @summary Registers a new user in the system.
   * @description Sends the sign-up command to the API and navigates to the login page upon success.
   * @param signUpCommand The command object containing the new user's details.
   * @param router The Angular Router service used for navigation.
   */
  signUp(signUpCommand: SignUpCommand, router: Router) {
    this.iamApi.signUp(signUpCommand).subscribe({
      next: (signUpResource) => {
        console.log('Sign-up successful:', signUpResource);
        router.navigate(['/login']).then();
      },
      error: (err) => {
        console.error('Sign-up failed:', err);
        this.isSignedInSignal.set(false);
        this.currentUsernameSignal.set(null);
        this.currentUserIdSignal.set(null);
        router.navigate(['/register']).then();
      }
    });
  }

  /**
   * @summary Signs out the current user.
   * @description Clears local storage tokens, resets the application state, clears the profile store, and redirects to the login page.
   * @param router The Angular Router service used for navigation.
   */
  signOut(router: Router) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.isSignedInSignal.set(false);
    this.currentUsernameSignal.set(null);
    this.currentUserIdSignal.set(null);
    this.profileStore.reset();
    router.navigate(['/login']).then();
  }
}

