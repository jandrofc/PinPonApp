import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonLabel, IonList, IonItem } from '@ionic/angular/standalone';
import { BarraMenuComponent } from 'src/app/componentes/barra-menu/barra-menu.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [IonItem, IonLabel,IonItem ,IonContent,IonLabel, CommonModule, FormsModule,BarraMenuComponent]
})
export class MenuPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
