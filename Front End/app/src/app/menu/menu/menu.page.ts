import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from 'src/app/explore-container/explore-container.component';
import { TabsPage } from 'src/app/tabs/tabs.page';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule]
})
export class MenuPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
