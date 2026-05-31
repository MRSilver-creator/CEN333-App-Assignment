import { Component, Input, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'm-main-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './m-main-menu.component.html',
  styleUrl: './m-main-menu.component.css'
})
export class MMainMenuComponent {
  private menuItems: string[]; 
  @Output() menuclick = new EventEmitter<string>();

  constructor(private router: Router){
    this.menuItems = [];
  }

  @Input()
  set menuitems(value: string[]){
    this.menuItems = value; 
  }

  get menuitems(): string[]{
    return this.menuItems;
  }
  feature2path(feature: string){
    return feature.replace(/\s+/g, '').toLowerCase();
  }
  routeToPage(feature: string){
    this.menuclick.emit(feature); 
  }
}
