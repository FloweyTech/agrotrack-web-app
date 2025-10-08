import {Component, inject} from '@angular/core';
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

@Component({
  selector: 'app-plot-form',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    PlantTypeSelector,
    MatButton
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
  isEdit = false;

  constructor() {
    this.route.params.subscribe((params: any) => {
      this.organizationId = +params['orgId'] || 0;
    });
  }

  submit(): void {
    if (!this.plotForm.valid) return;

    const formValue = this.plotForm.value;

    const plot = new Plot({
      id: Date.now(),
      name: formValue.name!,
      area: formValue.area!,
      location: formValue.location ?? '',
      plantType: formValue.plantType!,
      organizationId: this.organizationId
    });

    this.store.addPlot(plot);
    this.router.navigate(['/plots']).then();
  }

  goBack(): void {
    this.router.navigate(['/plots']).then();
  }

}
