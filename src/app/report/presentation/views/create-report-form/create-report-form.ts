import { Component, inject } from '@angular/core';
import { BaseForm } from '../../../../shared/presentation/components/base-form/base-form';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatError, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatSelect, MatOption } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { ReportStore } from '../../../application/report.store';
import { CreateReportCommand } from '../../../domain/model/create-report.command';

/**
 * Component for the create report form.
 * @author FloweyTech developer team
 */
@Component({
  selector: 'app-create-report-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCard, MatCardHeader, MatCardTitle, MatCardContent,
    MatFormField, MatInput, MatButton, MatError, MatLabel, MatSelect, MatOption
  ],
  templateUrl: './create-report-form.html',
  styleUrls: ['./create-report-form.css']
})
export class CreateReportForm extends BaseForm {
  private store = inject(ReportStore);
  private router = inject(Router);
  // Asumimos que obtienes orgId y plotId de algún lado (URL o selección previa)
  // Para este ejemplo los hardcodeo o los saco de un form adicional

  form = new FormGroup({
    organizationId: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required] }),
    plotId: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    metricType: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    periodStart: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    periodEnd: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  performCreate() {
    if (this.form.invalid) return;

    const command = new CreateReportCommand({
      organizationId: Number(this.form.value.organizationId),
      plotId: Number(this.form.value.plotId),
      type: this.form.value.type!,
      metricType: this.form.value.metricType!,
      periodStart: this.form.value.periodStart!,
      periodEnd: this.form.value.periodEnd!
    });

    this.store.createReport(command, this.router);
  }
}
