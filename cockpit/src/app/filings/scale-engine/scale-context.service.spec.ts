import { TestBed } from '@angular/core/testing';

import { ScaleContextService } from './scale-context.service';

describe('ScaleContextService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScaleContextService = TestBed.get(ScaleContextService);
    expect(service).toBeTruthy();
  });
});
