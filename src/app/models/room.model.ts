import { Construction } from './construction.model';

export interface Room {
  id: number;
  name: string;
  internalTemp: number; // внутренняя температура
  externalTemp: number; // наружная температура
  height: number; // высота помещения
  walls: Construction[];
  floors: Construction[];
  ceilings: Construction[];
  windows: Construction[];
  infiltrationRate: number; // инфильтрация, м³/ч
  volume?: number; // расчётный объём
}
