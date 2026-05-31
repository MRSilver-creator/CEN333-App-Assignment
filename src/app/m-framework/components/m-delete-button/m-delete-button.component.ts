import { Component, Output, EventEmitter  } from '@angular/core';

@Component({
  selector: 'm-delete-button',
  standalone: true,
  imports: [],
  templateUrl: './m-delete-button.component.html',
  styleUrl: './m-delete-button.component.css'
})
export class MDeleteButtonComponent {
  deleting: boolean = false;
  @Output() onClick: EventEmitter<any> = new EventEmitter();

  onDeleteButtonClick(event: MouseEvent) {
    if (!this.deleting) {
      this.deleting = true;
      setTimeout(() => {this.deleting = false;this.onClick.emit(event);
    }, 3200);
      
    }
    event.preventDefault();
  }
}
