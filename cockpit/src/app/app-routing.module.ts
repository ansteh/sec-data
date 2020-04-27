import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth/auth-guard.service';

import { AppComponent } from './app.component';
import { CandidatesComponent } from './candidates/candidates.component';
import { InterpreterComponent } from './imports/interpreter/interpreter.component';
import { DiaryComponent } from './diary/diary.component';
import { LoginComponent } from './auth/login/login.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { PortfolioSimulatorComponent } from './portfolio/portfolio-simulator/portfolio-simulator.component';
import { StocksComponent } from './stocks/stocks.component';
import { StockComponent } from './stock/stock.component';
import { CreateStockComponent } from './stocks/create-stock/create-stock.component';
import { StockMarketComponent } from './stock-market/stock-market.component';
import { StockOpportunitiesComponent } from './stock-market/stock-opportunities/stock-opportunities.component';

import { TransactionsComponent } from './imports/transactions/transactions.component';
import { FilingsComponent } from './filings/filings.component';
import { ScaleRankingComponent } from './filings/scale-ranking/scale-ranking.component';

const routes: Routes = [
  {
    path: 'candidates',
    component: CandidatesComponent
  },
  {
    path: 'interpreter',
    component: InterpreterComponent
  },
  {
    path: 'diary',
    component: DiaryComponent
  },
  {
    path: 'rankings',
    component: ScaleRankingComponent
  },
  {
    path: 'portfolio',
    component: PortfolioComponent
  },
  {
    path: 'portfolio-simulator',
    component: PortfolioSimulatorComponent
  },
  {
    path: 'stock/:ticker',
    component: StockComponent
  },
  {
    path: 'stock-editor',
    component: CreateStockComponent
  },
  {
    path: 'stock/filings/:ticker',
    component: FilingsComponent
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
