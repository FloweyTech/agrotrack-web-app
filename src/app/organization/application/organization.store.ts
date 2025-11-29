import {computed, Injectable, Signal, signal} from '@angular/core';
import {Organization} from '../domain/model/organization.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {OrganizationApi} from '../infrastructure/organization-api';
import {retry} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PlantType} from '../domain/model/plant-type.entity';
import {Plot} from '../domain/model/plot.entity';
import {Profile} from '../../profile/presentation/views/profile/profile';
import {profile} from '../../profile/domain/model/profile.entity';

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
  private readonly subscriptionsSignal = signal<Subscription[]>([]);
  readonly subscriptions = this.subscriptionsSignal.asReadonly();
  private readonly plantTypeSignal = signal<PlantType[]>([]);
  readonly planttypes = this.plantTypeSignal.asReadonly();
  private readonly plotsSignal = signal<Plot[]>([]);
  readonly plots = this.plotsSignal.asReadonly();
  private readonly selectedPlantTypeSignal = signal<PlantType | null>(null);
  readonly selectedPlantType = this.selectedPlantTypeSignal.asReadonly();
  private readonly profilesSignal = signal<profile[]>([]);
  readonly profiles = this.profilesSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();
  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();



  constructor(private organizationApi: OrganizationApi) {
    this.loadOrganizations();
    this.loadSubscriptions();
    this.loadPlantTypes();
    this.loadPlots(); // Agregar carga de parcelas
    this.loadProfiles();
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
   * Adds a new plot to an organization.
   * @param plot The Plot entity to create.
   */
  addPlot(plot: Plot): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createPlot(plot).pipe(retry(2)).subscribe({
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

  loadProfiles(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getProfiles().pipe(takeUntilDestroyed()).subscribe({
      next: profiles => {
        this.profilesSignal.set(profiles);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load profiles'));
        this.loadingSignal.set(false);
      }
    });
  }
  getMembersOfOrganization(orgId: number): Signal<profile[]> {
    return computed(() => {
      const org = this.organizations().find(o => o.id === orgId);
      if (!org) return [];
      const ids = new Set(org.members);
      return this.profiles().filter(p => ids.has(p.id));
    });
  }

  getAvailableProfilesForOrganization(orgId: number): Signal<profile[]> {
    return computed(() => {
      const org = this.organizations().find(o => o.id === orgId);
      if (!org) return this.profiles();
      const excluded = new Set<number>([org.ownerProfileId, ...org.members]);
      return this.profiles().filter(p => !excluded.has(p.id));
    });
  }


  addMemberToOrganization(orgId: number, profileId: number): void {
    const org = this.organizations().find(o => o.id === orgId);
    if (!org) return;
    if (org.members.includes(profileId)) return;

    const updated = new Organization({
      id: org.id,
      name: org.name,
      ownerProfileId: org.ownerProfileId,
      members: [...org.members, profileId],
      status: org.status,
      subscription: org.subscription
    });

    this.updateOrganization(updated);
  }

  removeMemberFromOrganization(orgId: number, profileId: number): void {
    const org = this.organizations().find(o => o.id === orgId);
    if (!org) return;
    if (!org.members.includes(profileId)) return;

    // (opcional) bloquear eliminar al dueño por si te llega mal el id
    if (profileId === org.ownerProfileId) return;

    const updated = new Organization({
      id: org.id,
      name: org.name,
      ownerProfileId: org.ownerProfileId,
      members: org.members.filter(id => id !== profileId),
      status: org.status,
      subscription: org.subscription
    });

    this.updateOrganization(updated);
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
