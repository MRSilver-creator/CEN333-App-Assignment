import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MTimeseriesChartComponent } from './m-timeserieschart.component';

describe('MTimeserieschartComponent', () => {
  let component: MTimeseriesChartComponent;
  let fixture: ComponentFixture<MTimeseriesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MTimeseriesChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MTimeseriesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
