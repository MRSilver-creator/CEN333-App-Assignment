import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MContainerComponent } from './m-container.component';

describe('MContainerComponent', () => {
  let component: MContainerComponent;
  let fixture: ComponentFixture<MContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
