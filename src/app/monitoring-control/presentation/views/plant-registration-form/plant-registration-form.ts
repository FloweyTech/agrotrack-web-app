import { Component, Output, EventEmitter } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';

interface Plant {
  id?: number;
  tempId?: number;
  height: number;
  leaves: number;
  fruits: number;
  date: string;
}

interface PlantAverage {
  height: number;
  leaves: number;
  fruits: number;
  date: string;
  plantsCount: number;
}

@Component({
  selector: 'app-plant-registration-form',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './plant-registration-form.html',
  styleUrl: './plant-registration-form.css'
})
export class PlantRegistrationForm {
  currentPlant: Plant = { height: 0, leaves: 0, fruits: 0, date: '' };
  sessionPlants: Plant[] = [];
  sessionAverage: PlantAverage | null = null;

  @Output() plantAdded = new EventEmitter<Plant>();

  addPlantToSession() {
    if (this.isValidPlant(this.currentPlant)) {
      const plantWithTempId = {
        ...this.currentPlant,
        tempId: Date.now() + Math.random()
      };
      this.sessionPlants.push(plantWithTempId);
      this.resetCurrentPlant();
      this.sessionAverage = null; // Reset average when adding new plant
    }
  }

  private isValidPlant(plant: Plant): boolean {
    return plant.height > 0 && plant.leaves >= 0 && plant.fruits >= 0 && plant.date !== '';
  }

  private resetCurrentPlant() {
    this.currentPlant = { height: 0, leaves: 0, fruits: 0, date: '' };
  }

  removeFromSession(tempId: number) {
    this.sessionPlants = this.sessionPlants.filter(p => p.tempId !== tempId);
    this.sessionAverage = null; // Reset average when removing plant
  }

  clearSession() {
    this.sessionPlants = [];
    this.sessionAverage = null;
    this.resetCurrentPlant();
  }

  calculateSessionAverage() {
    if (this.sessionPlants.length === 0) return;

    const total = this.sessionPlants.reduce((acc, p) => {
      acc.height += p.height;
      acc.leaves += p.leaves;
      acc.fruits += p.fruits;
      acc.date += new Date(p.date).getTime();
      return acc;
    }, { height: 0, leaves: 0, fruits: 0, date: 0 });

    const avgDate = new Date(total.date / this.sessionPlants.length);

    this.sessionAverage = {
      height: total.height / this.sessionPlants.length,
      leaves: total.leaves / this.sessionPlants.length,
      fruits: total.fruits / this.sessionPlants.length,
      date: avgDate.toISOString().substring(0, 10),
      plantsCount: this.sessionPlants.length
    };
  }

  saveSession() {
    if (this.sessionAverage && this.sessionPlants.length > 0) {
      // Crear un registro promediado para enviar al componente padre
      const averagedPlant: Plant = {
        id: Date.now(),
        height: this.sessionAverage.height,
        leaves: Math.round(this.sessionAverage.leaves),
        fruits: Math.round(this.sessionAverage.fruits),
        date: this.sessionAverage.date
      };

      this.plantAdded.emit(averagedPlant);
      this.clearSession();
    }
  }

  // Método obsoleto - ya no se usa
  addPlant() {
    // Este método ya no se usa con la nueva lógica de sesión
  }

  // Método obsoleto - ya no se usa
  calculateAverage() {
    // Este método ya no se usa con la nueva lógica de sesión
  }
}
