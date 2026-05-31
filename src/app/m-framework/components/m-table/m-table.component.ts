import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MDeleteButtonComponent } from '../m-delete-button/m-delete-button.component';

@Component({
  selector: 'm-table',
  standalone: true,
  imports: [CommonModule, MDeleteButtonComponent],
  templateUrl: './m-table.component.html',
  styleUrl: './m-table.component.css',
})
export class MTableComponent {

  @Input() data: any[] = [];
  @Input() filterTerm: string = '';
  @Input() showDeleteButton: boolean = false;
  @Input() showMoreDetails: boolean = false;
  @Input() showCaption: boolean = false;
  @Input() caption: string = 'Table Caption';
  @Input() tableHeaders: any[] = [];
  @Input() columnsToBeDisplayed: string[] = [];

  @Output() remove: EventEmitter<any> = new EventEmitter<any>();
  @Output() navigate: EventEmitter<any> = new EventEmitter<any>();
  /** Alias for navigate — used by map/profile components */
  @Output() moreDetails: EventEmitter<any> = new EventEmitter<any>();

  private originalData: any[] = [];
  public isStringData: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.originalData = [...this.data];
      this.checkDataType();
    }
    if (changes['filterTerm']) {
      this.filterData(this.filterTerm);
    }
  }

  checkDataType(): void {
    if (this.data.length > 0) {
      this.isStringData = typeof this.data[0] === 'string';
    }
  }

  getObjectKeys(obj: any): string[] {
    if (!obj) return [];
    if (this.isStringData) return ['Value'];
    return Object.keys(obj);
  }

  showDetails(item: any): void {
    this.navigate.emit(item);
    this.moreDetails.emit(item);
  }

  removeItem(item: any): void {
    this.remove.emit(item);
  }

  filterData(searchTerm: string): void {
    if (!searchTerm) {
      this.data = [...this.originalData];
    } else {
      this.data = this.originalData.filter(item =>
        typeof item === 'string'
          ? item.toLowerCase().includes(searchTerm.toLowerCase().trim())
          : Object.values(item).some((v: any) =>
              v?.toString().toLowerCase().includes(searchTerm.toLowerCase().trim())
            )
      );
    }
  }
}
