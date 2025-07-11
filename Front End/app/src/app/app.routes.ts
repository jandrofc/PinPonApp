import { Routes } from '@angular/router';


export const routes: Routes = [
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
        data: { shouldReuse: false } // <-- Evita caché
      },
      {
        path: 'tab2',
        loadComponent: () => import('./tab2/tab2.page').then(m => m.Tab2Page),
        data: { shouldReuse: false } // <-- Evita caché
      },
      {
        path: 'tab3',
        loadComponent: () => import('./tab3/tab3.page').then(m => m.Tab3Page),
        data: { shouldReuse: false } // <-- Evita caché
      },
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'scan-inventario',
    loadComponent: () => import('./lista/scan-inventario/scan-inventario.page').then( m => m.ScanInventarioPage)
  },
  {
    path: 'registro-producto',
    loadComponent: () => import('./registro-producto/registro-producto.page').then( m => m.RegistroProductoPage)
  }

];
