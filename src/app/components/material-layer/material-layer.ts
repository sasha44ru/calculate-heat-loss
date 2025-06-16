import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ConstructionLayer} from '../../models/construction.model';
import {Material} from '../../models/material.model';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-material-layer',
  imports: [
    FormsModule
  ],
  templateUrl: './material-layer.html',
  styleUrl: './material-layer.scss'
})
export class MaterialLayer {
  @Input() layer: ConstructionLayer;
  @Input() availableMaterials: Material[];
  @Output() layerChange = new EventEmitter<ConstructionLayer>();
  @Output() remove = new EventEmitter<void>();

  onMaterialChange(material: Material): void {
    this.layer.material = material;
    this.layerChange.emit(this.layer);
  }

  onThicknessChange(thickness: number): void {
    this.layer.thickness = thickness;
    this.layerChange.emit(this.layer);
  }

  onRemove(): void {
    this.remove.emit();
  }
}
