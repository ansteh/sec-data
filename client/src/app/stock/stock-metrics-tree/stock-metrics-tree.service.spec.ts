import { TestBed, inject } from '@angular/core/testing';

import { StockMetricsTreeService } from './stock-metrics-tree.service';

describe('StockMetricsTreeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StockMetricsTreeService]
    });
  });

  it('should be created', inject([StockMetricsTreeService], (service: StockMetricsTreeService) => {
    expect(service).toBeTruthy();
  }));
});
