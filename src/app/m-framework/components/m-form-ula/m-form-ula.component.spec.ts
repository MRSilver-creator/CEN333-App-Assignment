import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MFormUlaComponent } from './m-form-ula.component';

describe('MFormUlaComponent', () => {
  let component: MFormUlaComponent;
  let fixture: ComponentFixture<MFormUlaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MFormUlaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MFormUlaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
