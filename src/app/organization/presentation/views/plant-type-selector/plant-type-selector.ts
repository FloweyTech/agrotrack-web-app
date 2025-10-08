import {Component, inject, signal} from '@angular/core';
import {OrganizationStore} from '../../../application/organization.store';
import {Router} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {PlantType} from '../../../domain/model/plant-type.entity';
import {MatFormField} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-plant-type-selector',
  imports: [
    MatFormField,
    MatLabel,
    TranslatePipe,
    MatSelect,
    MatOption,
    MatInput,
    FormsModule,
    MatButton
  ],
  templateUrl: './plant-type-selector.html',
  styleUrl: './plant-type-selector.css'
})
export class PlantTypeSelector {
  readonly store = inject(OrganizationStore);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  addingCustomPlantType = signal(false);
  newTypeName = signal('');

  /**
   * Select a plant type and navigate to the next step.
   * @param type The selected plantType
   */
  selectPlantType(type: PlantType): void {
    this.store.setSelectedPlantType(type);
  }

  /**
   * Start adding a custom plant type.
   */
  enableAddCustomPlantType(): void {
    this.addingCustomPlantType.set(true);
  }

  /**
   * Add a new custom plant type.
   */
  addCustomPlantType(): void {
    const typeName = this.newTypeName().trim();
    if(!typeName) return;

    const newPlantType = new PlantType({
      id: Date.now(),
      name: typeName,
      type: null!,
      isCustom: true
    });
    this.store.addPlantType(newPlantType);
    this.store.setSelectedPlantType(newPlantType);

    this.newTypeName.set('');
    this.addingCustomPlantType.set(false);
  }
  /** Cancel adding a custom plant type. */
  cancelAddCustomPlantType(): void {
    this.newTypeName.set('');
    this.addingCustomPlantType.set(false);
  }
}
