import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockMetricsTreeComponent } from './stock-metrics-tree.component';

describe('StockMetricsTreeComponent', () => {
  let component: StockMetricsTreeComponent;
  let fixture: ComponentFixture<StockMetricsTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockMetricsTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockMetricsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
