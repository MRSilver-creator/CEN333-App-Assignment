import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MLoginComponent } from './m-login.component';

describe('MLoginComponent', () => {
  let component: MLoginComponent;
  let fixture: ComponentFixture<MLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
