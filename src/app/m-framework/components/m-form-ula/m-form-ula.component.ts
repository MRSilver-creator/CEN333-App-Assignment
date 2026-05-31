import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MResultBoxComponent } from '../m-result-box/m-result-box.component';
@Component({
  selector: 'm-form-ula',
  standalone: true,
  imports: [CommonModule, FormsModule, MResultBoxComponent],
  templateUrl: './m-form-ula.component.html',
  styleUrl: './m-form-ula.component.css',
})
export class MFormUlaComponent {
  @Input() label: string = '';
  @Input() class: string = '';
  @Input() result: string = '';
  @Output() calculate = new EventEmitter<void>();
  constructor() {}
  emitCalculateEvent() {
    this.calculate.emit(); 
  }
}
