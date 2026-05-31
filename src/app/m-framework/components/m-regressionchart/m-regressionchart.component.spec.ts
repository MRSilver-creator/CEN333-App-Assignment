import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MRegressionchartComponent } from './m-regressionchart.component';

describe('MRegressionchartComponent', () => {
  let component: MRegressionchartComponent;
  let fixture: ComponentFixture<MRegressionchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MRegressionchartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MRegressionchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
