import { TestBed } from '@angular/core/testing';

import { OutputsEmergentesService } from './outputs-emergentes.service';

describe('OutputsEmergentesService', () => {
  let service: OutputsEmergentesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutputsEmergentesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
