import { Routes } from '@angular/router';

import { CreateStockComponent } from './stocks/create-stock/create-stock.component';
import { StocksComponent } from './stocks/stocks.component';
import { StockComponent } from './stock/stock.component';
import { StockMarketComponent } from './stock-market/stock-market.component';
import { StockOpportunitiesComponent } from './stock-market/stock-opportunities/stock-opportunities.component';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/stocks',
    pathMatch: 'full'
  },
  {
    path: 'stocks',
    component: StocksComponent
  },
  {
    path: 'stock/create',
    component: CreateStockComponent
  },
  {
    path: 'stock/:ticker',
    component: StockComponent
  },
  {
    path: 'stock-market',
    component: StockMarketComponent,
    children: [
      { path: 'opportunities/:date', component: StockOpportunitiesComponent },
    ]
  },
  //{ path: '**', component: PageNotFoundComponent },
];
