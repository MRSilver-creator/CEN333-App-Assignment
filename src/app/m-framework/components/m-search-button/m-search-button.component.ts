import { Component, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'm-search-button',
  standalone: true,
  imports: [],
  templateUrl: './m-search-button.component.html',
  styleUrl: './m-search-button.component.css'
})
export class MSearchButtonComponent {
  @ViewChild('searchBtn') searchBtn!: ElementRef;
  @ViewChild('inputField') inputField!: ElementRef;
  @Output() search: EventEmitter<string> = new EventEmitter<string>();

  constructor(private renderer: Renderer2) { }

  toggleSearch() {
    this.renderer.addClass(this.searchBtn.nativeElement, 'bg-green');
    this.renderer.addClass(this.searchBtn.nativeElement.querySelector('i'), 'color-white');
    const input = this.inputField.nativeElement;
    this.renderer.addClass(input, 'active-width');
    input.focus();
    this.search.emit(input.value);
    input.value = '';
  }
  onSearch(value: string) {
    this.search.emit(value);
}
}
