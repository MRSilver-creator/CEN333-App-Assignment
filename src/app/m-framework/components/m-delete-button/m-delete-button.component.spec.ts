import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MDeleteButtonComponent } from './m-delete-button.component';

describe('MDeleteButtonComponent', () => {
  let component: MDeleteButtonComponent;
  let fixture: ComponentFixture<MDeleteButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MDeleteButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MDeleteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
