import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AuthModule } from './auth/auth.module';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material/material.module';

import { AppComponent } from './app.component';
import { CandidatesComponent } from './candidates/candidates.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { PortfolioAuditComponent } from './portfolio/portfolio-audit/portfolio-audit.component';
import { PortfolioSimulatorComponent } from './portfolio/portfolio-simulator/portfolio-simulator.component';

import { StocksComponent } from './stocks/stocks.component';
import { StockComponent } from './stock/stock.component';
import { CreateStockComponent } from './stocks/create-stock/create-stock.component';
import { StockMetricChartComponent } from './stock/stock-metric-chart/stock-metric-chart.component';
import { StockMetricsTreeComponent } from './stock/stock-metrics-tree/stock-metrics-tree.component';
import { StockPricesChartComponent } from './stock/stock-prices-chart/stock-prices-chart.component';
import { StockMarketComponent } from './stock-market/stock-market.component';
import { StockOpportunitiesComponent } from './stock-market/stock-opportunities/stock-opportunities.component';

import { TransactionsComponent } from './imports/transactions/transactions.component';
import { FilingsComponent } from './filings/filings.component';

@NgModule({
  declarations: [
    AppComponent,
    PortfolioComponent,
    PortfolioAuditComponent,
    StocksComponent,
    TransactionsComponent,
    CandidatesComponent,
    StockComponent,
    StockMetricChartComponent,
    StockMetricsTreeComponent,
    StockPricesChartComponent,
    StockMarketComponent,
    StockOpportunitiesComponent,
    CreateStockComponent,
    PortfolioSimulatorComponent,
    FilingsComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,

    AppRoutingModule,
    AuthModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
