import { TestBed, inject } from '@angular/core/testing';

import { CandidatesService } from './candidates.service';

describe('CandidatesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CandidatesService]
    });
  });

  it('should be created', inject([CandidatesService], (service: CandidatesService) => {
    expect(service).toBeTruthy();
  }));
});
