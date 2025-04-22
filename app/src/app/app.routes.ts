import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },  {
    path: 'barcode-scanner',
    loadComponent: () => import('./barcode-scanner/barcode-scanner.page').then( m => m.BarcodeScannerPage)
  },

];
