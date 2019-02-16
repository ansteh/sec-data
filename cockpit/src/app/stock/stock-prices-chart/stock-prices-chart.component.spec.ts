import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockPricesChartComponent } from './stock-prices-chart.component';

describe('StockPricesChartComponent', () => {
  let component: StockPricesChartComponent;
  let fixture: ComponentFixture<StockPricesChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockPricesChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockPricesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
