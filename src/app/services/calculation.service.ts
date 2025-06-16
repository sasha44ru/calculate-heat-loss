import { Injectable } from '@angular/core';
import { Room } from '../models/room.model';
import {Construction, ConstructionLayer, ConstructionType} from '../models/construction.model';
import {MATERIALS} from '../models/material.model';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {
  calculateHeatLoss(room: Room): { total: number, details: any } {
    const results = {
      total: 0,
      details: {
        walls: 0,
        floors: 0,
        ceilings: 0,
        windows: 0,
        infiltration: 0
      }
    };

    // Расчёт для стен
    room.walls.forEach(wall => {
      const loss = this.calculateConstructionHeatLoss(
        wall,
        room.internalTemp,
        this.getAdjacentTemperature(wall, room)
      );
      results.details.walls += loss;
      results.total += loss;
    });

    // Расчёт для полов
    room.floors.forEach(floor => {
      const loss = this.calculateConstructionHeatLoss(
        floor,
        room.internalTemp,
        this.getAdjacentTemperature(floor, room)
      );
      results.details.floors += loss;
      results.total += loss;
    });

    // Расчёт для потолков
    room.ceilings.forEach(ceiling => {
      const loss = this.calculateConstructionHeatLoss(
        ceiling,
        room.internalTemp,
        this.getAdjacentTemperature(ceiling, room)
      );
      results.details.ceilings += loss;
      results.total += loss;
    });

    // Расчёт для окон
    room.windows.forEach(window => {
      const loss = this.calculateConstructionHeatLoss(
        window,
        room.internalTemp,
        room.externalTemp
      );
      results.details.windows += loss;
      results.total += loss;
    });

    // Инфильтрация
    const infiltrationLoss = this.calculateInfiltrationHeatLoss(room);
    results.details.infiltration = infiltrationLoss;
    results.total += infiltrationLoss;

    return results;
  }

  calculateConstructionHeatLossDetailed(construction: Construction, internalTemp: number, externalTemp: number): { total: number, layers: { material: string, resistance: number, loss: number }[] } {
    if (Math.abs(internalTemp - externalTemp) < 0.1) {
      return { total: 0, layers: [] };
    }

    const result = {
      total: 0,
      layers: [] as { material: string, resistance: number, loss: number }[]
    };

    let currentR = 0.13; // начальное внутреннее сопротивление

    // Сортируем слои по порядку
    const sortedLayers = [...construction.layers].sort((a, b) => a.order - b.order);

    sortedLayers.forEach(layer => {
      const layerR = layer.thickness / layer.material.conductivity;
      currentR += layerR;

      const layerLoss = (1 / currentR) * construction.area * (internalTemp - externalTemp);

      result.layers.push({
        material: layer.material.name,
        resistance: layerR,
        loss: layerLoss
      });

      result.total += layerLoss;
    });

    // Добавляем внешнее сопротивление
    currentR += 0.04;
    result.total = (1 / currentR) * construction.area * (internalTemp - externalTemp);

    return result;
  }

  private getAdjacentTemperature(construction: Construction, room: Room): number {
    if (construction.hasHeatedAdjacent) {
      return room.internalTemp; // соседнее помещение отапливается
    }
    return construction.adjacentTemp !== undefined
      ? construction.adjacentTemp
      : room.externalTemp;
  }

  private calculateConstructionHeatLoss(
    construction: Construction,
    internalTemp: number,
    externalTemp: number
  ): number {
    if (Math.abs(internalTemp - externalTemp) < 0.1) return 0;

    const R = this.calculateTotalResistance(construction.layers);
    return (1 / R) * construction.area * (internalTemp - externalTemp);
  }

  private calculateTotalResistance(layers: ConstructionLayer[]): number {
    if (layers.length === 0) return 0;

    let totalR = 0.13; // внутреннее сопротивление

    // Сортируем слои по порядку
    const sortedLayers = [...layers].sort((a, b) => a.order - b.order);

    sortedLayers.forEach(layer => {
      totalR += layer.thickness / layer.material.conductivity;
    });

    totalR += 0.04; // внешнее сопротивление
    return totalR;
  }

  private calculateInfiltrationHeatLoss(room: Room): number {
    // Рассчитываем объём помещения
    const volume = this.calculateRoomVolume(room);
    const L = room.infiltrationRate * volume;
    return 0.28 * L * 1.2 * 1.005 * (room.internalTemp - room.externalTemp);
  }

  private calculateRoomVolume(room: Room): number {
    // Простая оценка объёма через площадь пола и высоту
    if (room.floors.length > 0) {
      return room.floors.reduce((sum, floor) => sum + floor.area, 0) * room.height;
    }
    return 50; // значение по умолчанию для небольших помещений
  }

  // Метод для получения рекомендуемых материалов по типу конструкции
  getMaterialsByType(type: ConstructionType): any {
    return MATERIALS.filter(m => {
      if (type === ConstructionType.WALL) {
        return m.category === 'wall' || m.category === 'insulation';
      }
      if (type === ConstructionType.FLOOR) {
        return m.category === 'floor' || m.category === 'insulation';
      }
      if (type === ConstructionType.CEILING) {
        return m.category === 'roof' || m.category === 'insulation';
      }
      if (type === ConstructionType.WINDOW) {
        return m.category === 'window';
      }
      return false;
    });
  }
}
