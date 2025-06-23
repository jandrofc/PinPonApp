import { Component, EnvironmentInjector, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {  arrowBack, search, notifications, camera, bag, cubeOutline, cartOutline, barChartOutline, createOutline, trashOutline, trendingUp, trendingDown, logoUsd, alertCircleOutline, informationCircle, barcodeOutline, documentTextOutline, pricetagOutline, alertCircle, businessOutline, resizeOutline, layersOutline, warningOutline, cashOutline, cardOutline, saveOutline, closeOutline, pricetag, ribbon, layers, cube, alert, cash, downloadOutline, funnel } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({   
      "arrowBack":arrowBack, 
      "search":search, 
      "notifications":notifications, 
      "create-outline":createOutline, 
      "camera":camera , 
      "bag":bag, 
      "cube-outline":cubeOutline ,
      "cart-outline":cartOutline, 
      "barChart-outline":barChartOutline ,
      "trash-outline":trashOutline, 
      "trendingUp":trendingUp, 
      "trendingDown":trendingDown, 
      "logoUsd":logoUsd, 
      "alertCircle-outline":alertCircleOutline, 
      "informationCircle":informationCircle, 
      "barcode-outline":barcodeOutline, 
      "documentText-outline":documentTextOutline, 
      "pricetag-outline":pricetagOutline, 
      "alertCircle":alertCircle, 
      "business-outline":businessOutline, 
      "resize-outline":resizeOutline, 
      "layers-outline":layersOutline, 
      "warning-outline":warningOutline, 
      "cash-outline":cashOutline, 
      "card-outline":cardOutline, 
      "save-outline":saveOutline, 
      "close-outline":closeOutline,
      "pricetag":pricetag,
      "ribbon":ribbon,
      "cube":cube,
      "layers":layers,
      "alert":alert,
      "cash":cash,
      "download-outline":downloadOutline,
      "funnel":funnel,
      "trending-up":trendingUp,
      "trending-down":trendingDown
    });
  }
}
