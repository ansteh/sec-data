import { TestBed } from '@angular/core/testing';

import { ScaleEngineService } from './scale-engine.service';

describe('ScaleEngineService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScaleEngineService = TestBed.get(ScaleEngineService);
    expect(service).toBeTruthy();
  });
});
