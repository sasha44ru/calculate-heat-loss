import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Construction, ConstructionLayer} from '../../models/construction.model';
import {Material} from '../../models/material.model';
import {FormsModule} from '@angular/forms';
import {CalculationService} from '../../services/calculation.service';
import {MaterialLayer} from '../material-layer/material-layer';

@Component({
  selector: 'app-construction-input',
  imports: [
    FormsModule,
    MaterialLayer
  ],
  templateUrl: './construction-input.html',
  styleUrl: './construction-input.scss'
})
export class ConstructionInput implements OnInit {
  @Input() construction: Construction;
  @Output() constructionChange = new EventEmitter<Construction>();
  @Output() remove = new EventEmitter<void>();

  availableMaterials: Material[];
  adjacentTempOptions = [
    { value: undefined, label: 'Наружная температура' },
    { value: 5, label: 'Неотапливаемое помещение (+5°C)' },
    { value: 10, label: 'Техническое помещение (+10°C)' },
    { value: 15, label: 'Отапливаемое слабо (+15°C)' },
    { value: 20, label: 'Отапливаемое (+20°C)' }
  ];

  constructor(private calculationService: CalculationService) {}

  ngOnInit(): void {
    this.availableMaterials = this.calculationService.getMaterialsByType(this.construction.type);
  }



  addLayer(): void {
    const newLayer: ConstructionLayer = {
      material: this.availableMaterials[0],
      thickness: 0.1,
      order: this.construction.layers.length + 1
    };
    this.construction.layers.push(newLayer);
    this.emitChanges();
  }

  onLayerChange(layer: ConstructionLayer, index: number): void {
    this.construction.layers[index] = layer;
    this.emitChanges();
  }

  onLayerRemove(index: number): void {
    this.construction.layers.splice(index, 1);
    // Обновляем порядковые номера
    this.construction.layers.forEach((layer, i) => layer.order = i + 1);
    this.emitChanges();
  }

  emitChanges(): void {
    if ( this.construction.height && this.construction.width) {
      this.construction.area = this.construction.height * this.construction.width;
    }
    this.constructionChange.emit(this.construction);
  }

  onRemove(): void {
    this.remove.emit();
  }
}
