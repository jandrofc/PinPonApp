import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScanInventarioPage } from './scan-inventario.page';

describe('ScanInventarioPage', () => {
  let component: ScanInventarioPage;
  let fixture: ComponentFixture<ScanInventarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanInventarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
