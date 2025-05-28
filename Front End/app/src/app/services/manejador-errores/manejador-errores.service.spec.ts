import { TestBed } from '@angular/core/testing';

import { ManejadorErroresService } from './manejador-errores.service';

describe('ManejadorErroresService', () => {
  let service: ManejadorErroresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManejadorErroresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
