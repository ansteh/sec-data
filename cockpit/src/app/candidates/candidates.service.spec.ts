import { TestBed } from '@angular/core/testing';

import { CandidatesService } from './candidates.service';

describe('CandidatesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CandidatesService = TestBed.get(CandidatesService);
    expect(service).toBeTruthy();
  });
});
