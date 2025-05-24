import { TestBed } from '@angular/core/testing';

import { ModalesService } from './modales.service';

describe('ModalesService', () => {
  let service: ModalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
