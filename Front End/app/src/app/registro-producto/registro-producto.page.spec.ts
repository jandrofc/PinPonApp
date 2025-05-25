import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroProductoPage } from './registro-producto.page';

describe('RegistroProductoPage', () => {
  let component: RegistroProductoPage;
  let fixture: ComponentFixture<RegistroProductoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroProductoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
