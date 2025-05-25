import { Component, EnvironmentInjector, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {  ellipse, arrowBack, search, notifications, camera, bag, cubeOutline, cartOutline, barChartOutline, createOutline, trashOutline, trendingUp, trendingDown, logoUsd  } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({   arrowBack, search, notifications, createOutline, camera , bag, cubeOutline ,cartOutline, barChartOutline ,trashOutline, trendingUp, trendingDown, logoUsd });
  }
}
