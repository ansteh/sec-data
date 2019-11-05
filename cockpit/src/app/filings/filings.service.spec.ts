import { TestBed } from '@angular/core/testing';

import { FilingsService } from './filings.service';

describe('FilingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FilingsService = TestBed.get(FilingsService);
    expect(service).toBeTruthy();
  });
});
