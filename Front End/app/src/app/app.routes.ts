import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: 'barcode-scanner',
    loadComponent: () => import('./barcode-scanner/barcode-scanner.page').then( m => m.BarcodeScannerPage)
  },
  {
    path: '',
    loadComponent: () => import('./menu/menu/menu.page').then( m => m.MenuPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'tab1',
        loadComponent: () => import('./tab1/tab1.page').then(m => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () => import('./tab2/tab2.page').then(m => m.Tab2Page),
      },
      {
        path: 'tab3',
        loadComponent: () => import('./tab3/tab3.page').then(m => m.Tab3Page),
      },
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full',
      },
    ],
  },  {
    path: 'editar',
    loadComponent: () => import('./formularios/editar/editar.page').then( m => m.EditarPage)
  },

];
