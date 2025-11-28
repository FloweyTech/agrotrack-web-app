import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EnvironmentalReading } from '../domain/model/environmental-reading.entity';
import { EnvironmentalReadingResource, EnvironmentalReadingsResponse } from './environmental-readings-response';
import { EnvironmentalReadingAssembler } from './environmental-reading-assembler';
import { Injectable } from '@angular/core';

/**
 * API endpoint for managing environmental readings.
 */
@Injectable({
  providedIn: 'root'
})
export class MonitoringApiEndpoint extends BaseApiEndpoint<EnvironmentalReading, EnvironmentalReadingResource, EnvironmentalReadingsResponse, EnvironmentalReadingAssembler> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}${environment.platformProviderEnvironmentalReadingEndpointPath}`,
      new EnvironmentalReadingAssembler()
    );
  }

  /**
   * Retrieves all readings for a specific plot.
   * @param plotId - The ID of the plot to filter readings.
   * @returns Observable emitting an array of EnvironmentalReading entities.
   */
  getReadingsByPlotId(plotId: number): Observable<EnvironmentalReading[]> {
    const url = `${environment.platformProviderApiBaseUrl}/api/v1/environment-readings/plot/${plotId}`;
    return this.http.get<EnvironmentalReadingResource[]>(url).pipe(
      map((resources) => resources.map(resource => this.assembler.toEntityFromResource(resource)))
    );
  }

  /**
   * Creates a new environmental reading record.
   * @param reading - The EnvironmentalReading entity to create.
   * @returns Observable emitting the created EnvironmentalReading entity.
   */
  createReading(reading: EnvironmentalReading): Observable<EnvironmentalReading> {
    const resource = this.assembler.toResourceFromEntity(reading);
    const url = `${environment.platformProviderApiBaseUrl}/api/v1/environment-readings`;
    return this.http.post<EnvironmentalReadingResource>(url, resource).pipe(
      map((res) => this.assembler.toEntityFromResource(res))
    );
  }
}
