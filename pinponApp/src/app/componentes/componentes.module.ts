import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarraMenuComponent } from './barra-menu/barra-menu.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BarraMenuComponent
  ],
  exports: [
    // Components
    BarraMenuComponent
  ],
})
export class ComponentesModule { }
