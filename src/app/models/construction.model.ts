import { Material } from './material.model';

export enum ConstructionType {
  WALL = 'wall',
  FLOOR = 'floor',
  CEILING = 'ceiling',
  WINDOW = 'window'
}

export interface ConstructionLayer {
  material: Material;
  thickness: number; // в метрах
  order: number; // порядковый номер слоя
}

export interface Construction {
  id: number;
  name: string;
  height: number;
  width: number;
  type: ConstructionType;
  layers: ConstructionLayer[];
  area: number; // площадь в м²
  adjacentTemp?: number; // температура смежного помещения
  isExternal?: boolean;
  orientation?: 'north' | 'south' | 'east' | 'west'; // ориентация для стен
  hasHeatedAdjacent?: boolean; // есть ли отапливаемое помещение рядом
}

export interface LayerContribution {
  name: string;
  material: Material;
  thickness: number;
  resistance: number;
  standaloneLoss: number;  // Потери если бы слой был один
  contribution: number;    // Вклад в общие потери
  efficiency: number;      // Эффективность (% сохраненного тепла)
}

export interface LayerContributionResult {
  total: number;
  layers: LayerContribution[];
  standaloneLayerLosses: number[];
  lossesWithoutLayers: number[];
  baseLoss?: number;
}

export interface HeatLossResult {
  total: number;
  details: {
    walls: number;
    floors: number;
    ceilings: number;
    windows: number;
    infiltration: number;
  };
}
