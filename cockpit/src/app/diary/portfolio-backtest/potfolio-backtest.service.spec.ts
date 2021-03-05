import { TestBed } from '@angular/core/testing';

import { PotfolioBacktestService } from './potfolio-backtest.service';

describe('PotfolioBacktestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PotfolioBacktestService = TestBed.get(PotfolioBacktestService);
    expect(service).toBeTruthy();
  });
});
