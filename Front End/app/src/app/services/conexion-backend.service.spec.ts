import { TestBed } from '@angular/core/testing';

import { ConexionBackendService } from './conexion-backend.service';

describe('ConexionBackendService', () => {
  let service: ConexionBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConexionBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
