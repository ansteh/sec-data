import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioSimulatorComponent } from './portfolio-simulator.component';

describe('PortfolioSimulatorComponent', () => {
  let component: PortfolioSimulatorComponent;
  let fixture: ComponentFixture<PortfolioSimulatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioSimulatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
