import {computed, Injectable, Signal, signal} from '@angular/core';
import {Organization} from '../domain/model/organization.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {OrganizationApi} from '../infrastructure/organization-api';
import {retry} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PlantType} from '../domain/model/plant-type.entity';
import {Plot} from '../domain/model/plot.entity';
import {OrganizationByOwnerResponse} from '../infrastructure/organization-by-owner-response';
import {PlotByOrganizationResponse} from '../infrastructure/plot-by-organization-response';

/**
 * State management store for organization-related data using Angular signals.
 */
@Injectable({
  providedIn: 'root'
})
export class OrganizationStore {
  readonly organizationCount = computed(() => this.organizations().length);
  readonly subscriptionCount = computed(() => this.subscriptions().length);
  readonly planttypeCount = computed(() => this.planttypes().length);
  readonly plotyCount = computed(()=> this.plots().length);
  private readonly organizationsSignal = signal<Organization[]>([]);
  readonly organizations = this.organizationsSignal.asReadonly();
  private readonly organizationsByOwnerSignal = signal<OrganizationByOwnerResponse[]>([]);
  readonly organizationsByOwner = this.organizationsByOwnerSignal.asReadonly();
  private readonly subscriptionsSignal = signal<Subscription[]>([]);
  readonly subscriptions = this.subscriptionsSignal.asReadonly();
  private readonly plantTypeSignal = signal<PlantType[]>([]);
  readonly planttypes = this.plantTypeSignal.asReadonly();
  private readonly plotsSignal = signal<Plot[]>([]);
  readonly plots = this.plotsSignal.asReadonly();
  private readonly plotsByOrganizationSignal = signal<PlotByOrganizationResponse[]>([]);
  readonly plotsByOrganization = this.plotsByOrganizationSignal.asReadonly();
  private readonly plantTypesListSignal = signal<any[]>([]);
  readonly plantTypesList = this.plantTypesListSignal.asReadonly();
  private readonly profileMembersSignal = signal<any[]>([]);
  readonly profileMembers = this.profileMembersSignal.asReadonly();
  private readonly profileSearchResultsSignal = signal<any[]>([]);
  readonly profileSearchResults = this.profileSearchResultsSignal.asReadonly();
  private readonly selectedPlantTypeSignal = signal<PlantType | null>(null);
  readonly selectedPlantType = this.selectedPlantTypeSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();
  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  constructor(private organizationApi: OrganizationApi) {
    this.loadOrganizations();
    this.loadSubscriptions();
    this.loadPlantTypes();
    this.loadPlots(); // Agregar carga de parcelas
  }

  /**
   * Loads organizations by owner profile ID.
   * @param ownerProfileId The profile ID of the owner.
   */
  loadOrganizationsByOwner(ownerProfileId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getOrganizationsByOwner(ownerProfileId).pipe(retry(2)).subscribe({
      next: organizations => {
        console.log('Organizations by owner loaded:', organizations);
        this.organizationsByOwnerSignal.set(organizations);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load organizations'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Creates a new organization with subscription.
   * @param request The subscription and organization data.
   */
  createOrganizationWithSubscription(request: any): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createOrganizationWithSubscription(request).pipe(retry(2)).subscribe({
      next: response => {
        console.log('Organization created:', response);
        // Reload organizations list
        const profileId = sessionStorage.getItem('profile_id');
        if (profileId) {
          this.loadOrganizationsByOwner(parseInt(profileId, 10));
        }
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create organization'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Activates a subscription.
   * @param subscriptionId The ID of the subscription to activate.
   */
  activateSubscription(subscriptionId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.activateSubscription(subscriptionId).pipe(retry(2)).subscribe({
      next: () => {
        console.log('Subscription activated successfully');
        // Reload organizations list to update isActive status
        const profileId = sessionStorage.getItem('profile_id');
        if (profileId) {
          this.loadOrganizationsByOwner(parseInt(profileId, 10));
        }
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to activate subscription'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Retrieves an organization by its ID as a signal.
   * @param id The ID of the organization.
   * @return A signal containing the organization or undefined if not found.
   */
  getOrganizationById(id: number): Signal<Organization | undefined> {
    return computed(() => id ? this.organizations().find(o => o.id === id) : undefined);
  }

  /**
   * Retrieves a subscription by its ID as a signal.
   * @param id The ID of the subscription.
   * @return A signal containing the subscription or undefined if not found.
   */
  getSubscriptionById(id: number): Signal<Subscription | undefined> {
    return computed(() => id ? this.subscriptions().find(s => s.id === id) : undefined);
  }

  /**
   * Creates a new plot.
   * @param request The plot creation request.
   * @param organizationId The organization ID to reload plots after creation.
   */
  createPlot(request: any, organizationId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createPlot(request).pipe(retry(2)).subscribe({
      next: () => {
        console.log('Plot created successfully');
        this.loadPlotsByOrganization(organizationId);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create plot'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads all plant types from the API.
   */
  loadAllPlantTypes(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getAllPlantTypes().pipe(retry(2)).subscribe({
      next: plantTypes => {
        console.log('Plant types loaded:', plantTypes);
        this.plantTypesListSignal.set(plantTypes);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load plant types'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Searches plant types by name.
   * @param name The name to search for.
   */
  searchPlantTypesByName(name: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getPlantTypesByName(name).pipe(retry(2)).subscribe({
      next: plantTypes => {
        console.log('Plant types found:', plantTypes);
        this.plantTypesListSignal.set(plantTypes);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to search plant types'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Searches profiles by name.
   * @param searchTerm The search term.
   */
  searchProfiles(searchTerm: string): void {
    if (!searchTerm || searchTerm.length < 2) {
      this.profileSearchResultsSignal.set([]);
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.searchProfiles(searchTerm).pipe(retry(2)).subscribe({
      next: profiles => {
        console.log('Profiles found:', profiles);
        this.profileSearchResultsSignal.set(profiles);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to search profiles'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Adds a profile to an organization.
   * @param organizationId The organization ID.
   * @param profileId The profile ID to add.
   */
  addProfileToOrganization(organizationId: number, profileId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.addProfileToOrganization(organizationId, { profileId }).pipe(retry(2)).subscribe({
      next: () => {
        console.log('Profile added to organization successfully');
        // Reload organizations to get updated profileIds
        const ownerProfileId = sessionStorage.getItem('profile_id');
        if (ownerProfileId) {
          this.organizationApi.getOrganizationsByOwner(parseInt(ownerProfileId, 10)).subscribe({
            next: orgs => {
              this.organizationsByOwnerSignal.set(orgs);
              // After organizations are updated, reload the members for this specific organization
              const updatedOrg = orgs.find(org => org.organizationId === organizationId);
              if (updatedOrg && updatedOrg.profileIds) {
                this.loadProfileMembers(updatedOrg.profileIds);
              }
              this.loadingSignal.set(false);
            },
            error: err => {
              this.errorSignal.set(this.formatError(err, 'Failed to reload organizations'));
              this.loadingSignal.set(false);
            }
          });
        } else {
          this.loadingSignal.set(false);
        }
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to add profile to organization'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Removes a profile from an organization.
   * @param organizationId The organization ID.
   * @param profileId The profile ID to remove.
   */
  removeProfileFromOrganization(organizationId: number, profileId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.removeProfileFromOrganization(organizationId, { profileId }).pipe(retry(2)).subscribe({
      next: () => {
        console.log('Profile removed from organization successfully');
        // Reload organizations to get updated profileIds
        const ownerProfileId = sessionStorage.getItem('profile_id');
        if (ownerProfileId) {
          this.organizationApi.getOrganizationsByOwner(parseInt(ownerProfileId, 10)).subscribe({
            next: orgs => {
              this.organizationsByOwnerSignal.set(orgs);
              // After organizations are updated, reload the members for this specific organization
              const updatedOrg = orgs.find(org => org.organizationId === organizationId);
              if (updatedOrg && updatedOrg.profileIds) {
                this.loadProfileMembers(updatedOrg.profileIds);
              }
              this.loadingSignal.set(false);
            },
            error: err => {
              this.errorSignal.set(this.formatError(err, 'Failed to reload organizations'));
              this.loadingSignal.set(false);
            }
          });
        } else {
          this.loadingSignal.set(false);
        }
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to remove profile from organization'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Clears profile search results.
   */
  clearProfileSearchResults(): void {
    this.profileSearchResultsSignal.set([]);
  }

  /**
   * Loads profile members by their IDs.
   * @param profileIds Array of profile IDs to load.
   */
  loadProfileMembers(profileIds: number[]): void {
    if (!profileIds || profileIds.length === 0) {
      this.profileMembersSignal.set([]);
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    // Fetch all profiles in parallel
    const profileRequests = profileIds.map(id => 
      this.organizationApi.getProfileById(id)
    );

    // Use forkJoin to wait for all requests to complete
    import('rxjs').then(({ forkJoin }) => {
      forkJoin(profileRequests).pipe(retry(2)).subscribe({
        next: profiles => {
          console.log('Profile members loaded:', profiles);
          this.profileMembersSignal.set(profiles);
          this.loadingSignal.set(false);
        },
        error: err => {
          this.errorSignal.set(this.formatError(err, 'Failed to load profile members'));
          this.loadingSignal.set(false);
        }
      });
    });
  }

  /**
   * Loads plots by organization ID from the API.
   * @param organizationId The ID of the organization.
   */
  loadPlotsByOrganization(organizationId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getPlotsByOrganization(organizationId).pipe(
      retry(2)
    ).subscribe({
      next: plots => {
        console.log('Plots by organization loaded:', plots);
        // Fetch plant type details for each plot
        plots.forEach(plot => {
          this.organizationApi.getPlantTypeById(plot.plantTypeId).subscribe({
            next: plantType => {
              plot.plantTypeDetails = {
                plantType: plantType.plantType,
                name: plantType.name
              };
              // Update the signal to trigger UI refresh
              this.plotsByOrganizationSignal.set([...plots]);
            },
            error: err => {
              console.error('Failed to load plant type:', err);
            }
          });
        });
        this.plotsByOrganizationSignal.set(plots);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load plots'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Retrieves plots filtered by organization ID as a signal.
   * @param organizationId The ID of the organization.
   * @return A signal containing the plots for that organization.
   */
  getPlotsByOrganizationId(organizationId: number): Signal<Plot[]> {
    return computed(() =>
      this.plots().filter(plot => plot.organizationId === organizationId)
    );
  }

  /**
   * Add a new organization.
   * @param organization - The organization to add.
   */
  addOrganization(organization: Organization): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createOrganization(organization).pipe(retry(2)).subscribe({
      next: createdOrganization => {
        createdOrganization = this.assignSubscriptionToOrganization(createdOrganization);
        this.organizationsSignal.update(organizations => [...organizations, createdOrganization]);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create organization'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Update an existing organization.
   * @param updatedOrganization - The organization to update.
   */
  updateOrganization(updatedOrganization: Organization): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.updateOrganization(updatedOrganization).pipe(retry(2)).subscribe({
      next: organization => {
        organization = this.assignSubscriptionToOrganization(organization);
        this.organizationsSignal.update(organizations =>
          organizations.map(o => o.id === organization.id ? organization : o));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update organization'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Delete an organization by its ID.
   * @param id - The ID of the organization to delete.
   */
  deleteOrganization(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.deleteOrganization(id).pipe(retry(2)).subscribe({
      next: () => {
        this.organizationsSignal.update(organizations => organizations.filter(o => o.id !== id));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete organization'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Add a new subscription.
   * @param subscription - The subscription to add.
   */
  addSubscription(subscription: Subscription): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createSubscription( subscription ).pipe(retry(2)).subscribe({
      next: createdSubscription => {
        this.subscriptionsSignal.update(subscriptions => [...subscriptions, createdSubscription]);
        this.loadingSignal.set(false)
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create subscription'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Update an existing subscription.
   * @param updatedSubscription - The subscription to update.
   */
  updateSubscription(updatedSubscription: Subscription): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.updateSubscription(updatedSubscription).pipe(retry(2)).subscribe({
      next: subscription => {
        this.subscriptionsSignal.update(subscriptions =>
          subscriptions.map(s => s.id === subscription.id ? subscription : s));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update subscription'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Delete a subscription by its ID.
   * @param id - The ID of the subscription to delete.
   */
  deleteSubscription(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.deleteSubscription(id).pipe(retry(2)).subscribe({
      next: () => {
        this.subscriptionsSignal.update(subscriptions => subscriptions.filter(s => s.id !== id));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete subscription'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Adds a new custom plant type.
   * @param plantType The PlantType entity to create.
   */
  addPlantType(plantType: PlantType): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    plantType.isCustom = true;
    this.organizationApi.createPlantType(plantType).pipe(retry(2)).subscribe({
      next: createdType => {
        this.plantTypeSignal.update(types => [...types, createdType]);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create plant type'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Sets the selected plant type globally.
   * @param plantType The plant type selected by the user.
   */
  setSelectedPlantType(plantType: PlantType): void {
    this.selectedPlantTypeSignal.set(plantType);
  }


  /**
   * Updates an existing plant type.
   * @param updatedPlantType The updated PlantType entity.
   */
  updatePlantType(updatedPlantType: PlantType): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.updatePlantType(updatedPlantType).pipe(retry(2)).subscribe({
      next: plantType => {
        this.plantTypeSignal.update(types =>
          types.map(pt => pt.id === plantType.id ? plantType : pt)
        );
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update plant type'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Deletes a plant type by its ID.
   * @param id The ID of the PlantType to delete.
   */
  deletePlantType(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.deletePlantType(id).pipe(retry(2)).subscribe({
      next: () => {
        this.plantTypeSignal.update(types => types.filter(pt => pt.id !== id));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete plant type'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Adds a new plot to an organization (old method - kept for compatibility).
   * @param plot The Plot entity to create.
   */
  addPlot(plot: Plot): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createPlotOld(plot).pipe(retry(2)).subscribe({
      next: createdPlot => {
        this.plotsSignal.update(plots => [...plots, createdPlot]);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create plot'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Updates an existing plot.
   * @param updatedPlot The updated Plot entity.
   */
  updatePlot(updatedPlot: Plot): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.updatePlot(updatedPlot).pipe(retry(2)).subscribe({
      next: plot => {
        this.plotsSignal.update(plots =>
          plots.map(p => p.id === plot.id ? plot : p)
        );
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update plot'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Deletes a plot by its ID.
   * @param id The ID of the plot to delete.
   */
  deletePlot(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.deletePlot(id).pipe(retry(2)).subscribe({
      next: () => {
        this.plotsSignal.update(plots => plots.filter(p => p.id !== id));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete plot'));
        this.loadingSignal.set(false);
      }
    });
  }


  /**
   * Loads all organizations from de API
   */
  private loadOrganizations(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getOrganizations().pipe(takeUntilDestroyed()).subscribe({
      next: organizations => {
        console.log(organizations);
        this.organizationsSignal.set(organizations);
        this.loadingSignal.set(false);
        this.assignSubscriptionsToOrganizations();
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load organizations'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads all subscriptions from de API
   */
  private loadSubscriptions(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getSubscriptions().pipe(takeUntilDestroyed()).subscribe({
      next: subscriptions => {
        console.log(subscriptions);
        this.subscriptionsSignal.set(subscriptions);
        this.loadingSignal.set(false);
        this.assignSubscriptionsToOrganizations();
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load subscriptions'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads all plant types from de API
   */
  loadPlantTypes(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getPlantTypes().pipe(takeUntilDestroyed()).subscribe({
      next: plantTypes => {
        console.log(plantTypes);
        this.plantTypeSignal.set(plantTypes);
        this.loadingSignal.set(false);
        this.assignPlantTypesToPlots();
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load plant types'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads all plots from the API
   */
  loadPlots(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getPlots().pipe(takeUntilDestroyed()).subscribe({
      next: plots => {
        console.log('All plots loaded:', plots);
        this.plotsSignal.set(plots);
        this.loadingSignal.set(false);
        this.assignPlantTypesToPlots();
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load plots'));
        this.loadingSignal.set(false);
      }
    })
  }

  private assignSubscriptionsToOrganizations(): void {
    this.organizationsSignal.update(organizations =>
      organizations.map(organization => this.assignSubscriptionToOrganization(organization))
    );
  }

  private assignSubscriptionToOrganization(organization: Organization): Organization {
    const subscription = this.subscriptions().find(
      s => s.id === organization.subscription?.id
    );
    if (subscription) organization.subscription = subscription;
    return organization;
  }

  private assignPlantTypesToPlots(): void {
    this.plotsSignal.update(plots =>
      plots.map(plot => this.assignPlantTypeToPlot(plot))
    );
  }

  private assignPlantTypeToPlot(plot: Plot): Plot {
    const plantType = this.planttypes().find(
      pt => pt.id === plot.plantType?.id
    );
    if (plantType) plot.plantType = plantType;
    return plot;
  }

  /**
   * Formats an error message for user-friendly display.
   * @param error The error object.
   * @param fallback - The fallback error message
   * @return A formatted error message.
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }
}
