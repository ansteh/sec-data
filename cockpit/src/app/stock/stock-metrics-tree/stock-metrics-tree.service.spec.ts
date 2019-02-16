import { TestBed } from '@angular/core/testing';

import { StockMetricsTreeService } from './stock-metrics-tree.service';

describe('StockMetricsTreeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StockMetricsTreeService = TestBed.get(StockMetricsTreeService);
    expect(service).toBeTruthy();
  });
});
