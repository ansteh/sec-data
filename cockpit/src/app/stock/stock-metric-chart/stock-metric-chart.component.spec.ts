import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockMetricChartComponent } from './stock-metric-chart.component';

describe('StockMetricChartComponent', () => {
  let component: StockMetricChartComponent;
  let fixture: ComponentFixture<StockMetricChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockMetricChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockMetricChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
