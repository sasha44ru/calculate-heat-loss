import {Component, model, OnInit} from '@angular/core';
import {Room} from './models/room.model';
import {CalculationService} from './services/calculation.service';
import {FormsModule} from '@angular/forms';
import {ConstructionInput} from './components/construction-input/construction-input';
import {DecimalPipe} from '@angular/common';
import {Construction, ConstructionType} from './models/construction.model';

@Component({
  selector: 'app-root',
  imports: [FormsModule, ConstructionInput, DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'calculate-heat-loss';

  room: Room = {
    id: 1,
    name: 'Моя комната',
    internalTemp: 20,
    externalTemp: -20,
    height: 2.8,
    infiltrationRate: 0.5,
    walls: [],
    floors: [],
    ceilings: [],
    windows: []
  };

  calculationResult: any = null;
  activeTab: 'walls' | 'floors' | 'ceilings' | 'windows' | 'settings' = 'walls';

  constructor(private calculationService: CalculationService) {}

  ngOnInit(): void {
    // Инициализация примера комнаты
    this.addWall();
    this.addFloor();
    this.addCeiling();
  }

  calculate(): void {
    this.calculationResult = this.calculationService.calculateHeatLoss(this.room);
  }

  addWall(): void {
    this.room.walls.push({
      id: Date.now(),
      name: 'Новая стена',
      type: ConstructionType.WALL,
      area: 10,
      width: 3.6,
      height: 2.7,
      layers: [],
      isExternal: true,
      orientation: 'north'
    });
  }

  addFloor(): void {
    this.room.floors.push({
      id: Date.now(),
      name: 'Пол',
      type: ConstructionType.FLOOR,
      area: 15,
      width: 3.6,
      height: 3,
      layers: [
        {
          material: { id: 20, name: 'Цементная стяжка', conductivity: 1.4 },
          thickness: 0.05,
          order: 1
        },
        {
          material: { id: 3, name: 'Пеноплекс', conductivity: 0.033 },
          thickness: 0.1,
          order: 2
        }
      ],
      adjacentTemp: 5 // температура подвала
    });
  }

  addCeiling(): void {
    this.room.ceilings.push({
      id: Date.now(),
      name: 'Потолок',
      type: ConstructionType.CEILING,
      area: 15,
      width: 3.6,
      height: 3,
      layers: [
        {
          material: { id: 30, name: 'Железобетонное перекрытие', conductivity: 1.69 },
          thickness: 0.2,
          order: 1
        }
      ],
      hasHeatedAdjacent: true // отапливаемое помещение сверху
    });
  }

  addWindow(): void {
    this.room.windows.push({
      id: Date.now(),
      name: 'Окно',
      type: ConstructionType.WINDOW,
      area: 2,
      width: 1.8,
      height: 1.8,
      layers: [
        {
          material: { id: 11, name: 'Двухкамерный стеклопакет', conductivity: 1.4 },
          thickness: 0.04,
          order: 1
        }
      ],
      isExternal: true
    });
  }

  onConstructionChange(construction: Construction, type: ConstructionType): void {
    // Обновляем конструкцию в соответствующем массиве
    const collection = this.getConstructionsByType(type);
    const index = collection.findIndex(c => c.id === construction.id);
    if (index >= 0) {
      collection[index] = construction;
    }
  }

  onConstructionRemove(id: number, type: ConstructionType): void {
    const collection = this.getConstructionsByType(type);
    const index = collection.findIndex(c => c.id === id);
    if (index >= 0) {
      collection.splice(index, 1);
    }
  }

  private getConstructionsByType(type: ConstructionType): Construction[] {
    switch (type) {
      case ConstructionType.WALL: return this.room.walls;
      case ConstructionType.FLOOR: return this.room.floors;
      case ConstructionType.CEILING: return this.room.ceilings;
      case ConstructionType.WINDOW: return this.room.windows;
      default: return [];
    }
  }

  // Аналогичные методы для добавления пола, потолка, окна
  protected readonly ConstructionType = ConstructionType;
  protected readonly model = model;
}
