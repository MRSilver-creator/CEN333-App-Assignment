import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MMainMenuComponent } from './m-main-menu.component';

describe('MMainMenuComponent', () => {
  let component: MMainMenuComponent;
  let fixture: ComponentFixture<MMainMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MMainMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MMainMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
