import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'order',
    loadChildren: () =>
      import('./modules/order/order.module').then((m) => m.OrderModule),
  },
  {
    path: 'product',
    loadChildren: () =>
      import('./modules/product/product.module').then((m) => m.ProductModule),
  },
];
