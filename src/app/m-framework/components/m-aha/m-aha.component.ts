import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'm-aha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './m-aha.component.html',
  styleUrl: './m-aha.component.css'
})
export class MAhaComponent{
  @Input() type: string = 'warning'; 
  @Input() header: string = 'Warning';
  
}
