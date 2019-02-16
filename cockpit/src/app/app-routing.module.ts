import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth/auth-guard.service';

import { AppComponent } from './app.component';
import { CandidatesComponent } from './candidates/candidates.component';
import { LoginComponent } from './auth/login/login.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { StocksComponent } from './stocks/stocks.component';
import { StockComponent } from './stock/stock.component';
import { CreateStockComponent } from './stocks/create-stock/create-stock.component';
import { StockMarketComponent } from './stock-market/stock-market.component';
import { StockOpportunitiesComponent } from './stock-market/stock-opportunities/stock-opportunities.component';

import { TransactionsComponent } from './imports/transactions/transactions.component';

const routes: Routes = [
  {
    path: 'candidates',
    component: CandidatesComponent
  },
  {
    path: 'portfolio',
    component: PortfolioComponent
  },
  {
    path: 'stock/:ticker',
    component: StockComponent
  },
  {
    path: 'stock/create',
    component: CreateStockComponent
  },
  {
    path: 'stocks',
    component: StocksComponent,
    // canActivate: [AuthGuard],
  },
  {
    path: 'stock-market',
    component: StockMarketComponent,
    children: [
      { path: 'opportunities/:date', component: StockOpportunitiesComponent },
    ]
  },
  {
    path: 'transactions',
    component: TransactionsComponent
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    redirectTo: '/stocks',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
