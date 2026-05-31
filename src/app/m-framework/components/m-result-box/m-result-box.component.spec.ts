import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MResultBoxComponent } from './m-result-box.component';

describe('MResultBoxComponent', () => {
  let component: MResultBoxComponent;
  let fixture: ComponentFixture<MResultBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MResultBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MResultBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
