import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MSearchbtnComponent } from './m-search-button.component';

describe('MSearchbtnComponent', () => {
  let component: MSearchbtnComponent;
  let fixture: ComponentFixture<MSearchbtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MSearchbtnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MSearchbtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
