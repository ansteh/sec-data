import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioCalibrationComponent } from './portfolio-calibration.component';

describe('PortfolioCalibrationComponent', () => {
  let component: PortfolioCalibrationComponent;
  let fixture: ComponentFixture<PortfolioCalibrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioCalibrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioCalibrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
