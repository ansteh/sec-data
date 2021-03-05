import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioBacktestComponent } from './portfolio-backtest.component';

describe('PortfolioBacktestComponent', () => {
  let component: PortfolioBacktestComponent;
  let fixture: ComponentFixture<PortfolioBacktestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioBacktestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioBacktestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
