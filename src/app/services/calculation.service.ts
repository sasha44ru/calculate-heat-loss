import { Injectable } from '@angular/core';
import { Room } from '../models/room.model';
import {
  Construction,
  ConstructionLayer,
  ConstructionType,
  HeatLossResult,
  LayerContributionResult
} from '../models/construction.model';
import {MATERIALS} from '../models/material.model';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {
  private readonly INTERNAL_RESISTANCE = 0.13; // Rsi (м²·°C/Вт)
  private readonly EXTERNAL_RESISTANCE = 0.04; // Rse (м²·°C/Вт)
  private readonly AIR_DENSITY = 1.2; // кг/м³
  private readonly AIR_HEAT_CAPACITY = 1.005; // кДж/(кг·°C)

  calculateHeatLoss(room: Room): HeatLossResult {
    const results: HeatLossResult = {
      total: 0,
      details: {
        walls: 0,
        floors: 0,
        ceilings: 0,
        windows: 0,
        infiltration: 0
      }
    };

    // Расчет для всех конструкций
    ['walls', 'floors', 'ceilings', 'windows'].forEach(type => {
      // @ts-ignore
      room[type as keyof Room].forEach(construction => {
        const externalTemp = type === 'windows'
          ? room.externalTemp
          : this.getAdjacentTemperature(construction, room);

        const loss = this.calculateConstructionHeatLoss(
          construction,
          room.internalTemp,
          externalTemp
        );

        results.details[type as keyof typeof results.details] += loss;
        results.total += loss;
      });
    });

    // Инфильтрация
    results.details.infiltration = this.calculateInfiltrationHeatLoss(room);
    results.total += results.details.infiltration;

    return results;
  }

  calculateLayerContribution(
    construction: Construction,
    internalTemp: number,
    externalTemp: number
  ): LayerContributionResult {
    const deltaT = internalTemp - externalTemp;
    const area = construction.area;
    const result: LayerContributionResult = {
      total: 0,
      layers: [],
      standaloneLayerLosses: [],
      lossesWithoutLayers: []
    };

    if (Math.abs(deltaT) < 0.1 || construction.layers.length === 0) {
      return result;
    }

    // Рассчитываем общее сопротивление
    const totalR = this.calculateTotalResistance(construction.layers);
    result.total = (1 / totalR) * area * deltaT;

    // Рассчитываем базовые потери без всех слоев (только стандартные сопротивления)
    const baseR = this.INTERNAL_RESISTANCE + this.EXTERNAL_RESISTANCE;
    const baseLoss = (1 / baseR) * area * deltaT;
    result.baseLoss = baseLoss;

    construction.layers
      .sort((a, b) => a.order - b.order)
      .forEach(layer => {
        const layerR = layer.thickness / layer.material.conductivity;

        // 1. Потери слоя "сам по себе"
        const standaloneR = this.INTERNAL_RESISTANCE + layerR + this.EXTERNAL_RESISTANCE;
        const standaloneLoss = (1 / standaloneR) * area * deltaT;

        // 2. Потери без текущего слоя
        let lossWithoutLayer: number;
        if (construction.layers.length === 1) {
          // Если это единственный слой, используем базовые потери
          lossWithoutLayer = baseLoss;
        } else {
          const layersWithoutCurrent = construction.layers.filter(l => l.order !== layer.order);
          const RWithoutLayer = this.calculateTotalResistance(layersWithoutCurrent);
          lossWithoutLayer = (1 / RWithoutLayer) * area * deltaT;
        }

        result.lossesWithoutLayers.push(lossWithoutLayer);

        // 3. Вклад слоя (сколько тепла сохраняет)
        const layerContribution = result.total - lossWithoutLayer;

        // 4. Эффективность как доля в общем сопротивлении
        const efficiency = (layerR / totalR) * 100;

        result.layers.push({
          name: layer.material.name,
          material: layer.material,
          thickness: layer.thickness,
          resistance: layerR,
          standaloneLoss,
          contribution: layerContribution,
          efficiency
        });

        result.standaloneLayerLosses.push(standaloneLoss);
      });

    return result;
  }

  private calculateConstructionHeatLoss(
    construction: Construction,
    internalTemp: number,
    externalTemp: number
  ): number {
    if (Math.abs(internalTemp - externalTemp) < 0.1 || construction.layers.length === 0) {
      return 0;
    }

    const R = this.calculateTotalResistance(construction.layers);
    return (1 / R) * construction.area * (internalTemp - externalTemp);
  }

  private calculateTotalResistance(layers: ConstructionLayer[]): number {
    if (layers.length === 0) return 0;

    let totalR = this.INTERNAL_RESISTANCE;

    layers
      .sort((a, b) => a.order - b.order)
      .forEach(layer => {
        totalR += layer.thickness / layer.material.conductivity;
      });

    return totalR + this.EXTERNAL_RESISTANCE;
  }

  private calculateInfiltrationHeatLoss(room: Room): number {
    const volume = this.calculateRoomVolume(room);
    const L = room.infiltrationRate * volume; // Воздухообмен, м³/ч
    return 0.28 * L * this.AIR_DENSITY * this.AIR_HEAT_CAPACITY *
      (room.internalTemp - room.externalTemp);
  }

  private calculateRoomVolume(room: Room): number {
    // Более точный расчет объема помещения
    if (room.floors.length > 0) {
      const floorArea = room.floors.reduce((sum, floor) => sum + floor.area, 0);
      return floorArea * room.height;
    } else if (room.walls.length > 0) {
      // Оценка через стены (для прямоугольных помещений)
      const wallAreas = room.walls.map(w => w.area);
      const perimeter = wallAreas.reduce((sum, area) => sum + area, 0) / room.height;
      const approxArea = Math.pow(perimeter / 4, 2); // Предполагаем квадратное помещение
      return approxArea * room.height;
    }
    return 50; // значение по умолчанию
  }

  private getAdjacentTemperature(construction: Construction, room: Room): number {
    if (construction.hasHeatedAdjacent) {
      return room.internalTemp;
    }
    return construction.adjacentTemp !== undefined
      ? construction.adjacentTemp
      : room.externalTemp;
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
