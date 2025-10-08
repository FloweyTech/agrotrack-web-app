import {Component, inject, effect} from '@angular/core';
import {OrganizationStore} from '../../../application/organization.store';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Plot} from '../../../domain/model/plot.entity';
import {PlantType} from '../../../domain/model/plant-type.entity';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {PlantTypeSelector} from '../plant-type-selector/plant-type-selector';
import {MatButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-plot-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe,
    PlantTypeSelector
  ],
  templateUrl: './plot-form.html',
  styleUrl: './plot-form.css'
})
export class PlotForm {
  readonly store = inject(OrganizationStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private fb = inject(FormBuilder);

  plotForm = this.fb.group({
    name: new FormControl<string>('',{nonNullable: true, validators: [Validators.required]}),
    area: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.1)] }),
    location: new FormControl<string>('', { nonNullable: true }),
    plantType: new FormControl<PlantType | null>(null, { validators: [Validators.required] })
  });

  organizationId!: number;
  plotId?: number;
  isEdit = false;
  currentPlot?: Plot;

  constructor() {
    this.route.params.subscribe((params: any) => {
      this.organizationId = +params['orgId'] || 0;
      this.plotId = params['id'] ? +params['id'] : undefined;
      this.isEdit = !!this.plotId;

      console.log('Route params:', { orgId: this.organizationId, plotId: this.plotId, isEdit: this.isEdit });
    });

    effect(() => {
      if (this.isEdit && this.plotId && this.organizationId) {
        console.log('Effect ejecutándose para edición');
        const plots = this.store.getPlotsByOrganizationId(this.organizationId)();
        console.log('Plots disponibles:', plots);
        this.currentPlot = plots.find(p => p.id === this.plotId);
        console.log('Plot encontrado para editar:', this.currentPlot);

        if (this.currentPlot) {
          console.log('Cargando datos en formulario');
          this.plotForm.patchValue({
            name: this.currentPlot.name,
            area: this.currentPlot.area,
            location: this.currentPlot.location,
            plantType: this.currentPlot.plantType
          });
        }
      }
    });
  }

  submit(): void {
    if (!this.plotForm.valid) return;

    const formValue = this.plotForm.value;
    console.log('Submit ejecutándose:', { isEdit: this.isEdit, currentPlot: this.currentPlot });

    if (this.isEdit && this.currentPlot) {
      console.log('Actualizando parcela existente');
      const updatedPlot = new Plot({
        id: this.currentPlot.id,
        name: formValue.name!,
        area: formValue.area!,
        location: formValue.location ?? '',
        plantType: formValue.plantType!,
        organizationId: this.organizationId
      });
      this.store.updatePlot(updatedPlot);
    } else {
      console.log('Creando nueva parcela');
      const plot = new Plot({
        id: Date.now(),
        name: formValue.name!,
        area: formValue.area!,
        location: formValue.location ?? '',
        plantType: formValue.plantType!,
        organizationId: this.organizationId
      });
      this.store.addPlot(plot);
    }

    this.router.navigate(['/organization', this.organizationId, 'plots']).then();
  }

  goBack(): void {
    this.router.navigate(['/organization', this.organizationId, 'plots']).then();
  }

}
