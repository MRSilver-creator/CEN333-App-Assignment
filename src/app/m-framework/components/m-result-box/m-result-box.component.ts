import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'm-result-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './m-result-box.component.html',
  styleUrl: './m-result-box.component.css'
})
export class MResultBoxComponent {
  @Input() label: string;
  @Input() value: string;
  @Input() class: string;
  constructor(){
    this.label = ""; 
    this.value = ""; 
    this.class = "normal";
    
  }
  
  
}
