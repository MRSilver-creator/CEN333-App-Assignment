import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAhaComponent } from './m-aha.component';

describe('MAhaComponent', () => {
  let component: MAhaComponent;
  let fixture: ComponentFixture<MAhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MAhaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MAhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
