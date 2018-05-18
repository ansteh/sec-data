import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatFormFieldModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { MatTableModule } from '@angular/material';
import { MatOptionModule } from '@angular/material';
import { MatSelectModule } from '@angular/material';
import { MatButtonModule } from '@angular/material';

import { ChartsModule } from 'ng2-charts/ng2-charts';

import { AppComponent } from './app.component';
import { TableFilteringExampleComponent } from './table-filtering-example/table-filtering-example.component';
import { StocksComponent } from './stocks/stocks.component';
import { CreateStockComponent } from './stocks/create-stock/create-stock.component';

import { StocksService } from './stocks/stocks.service';
import { StockService } from './stock/stock.service';
import { StockMetricsTreeService } from './stock/stock-metrics-tree/stock-metrics-tree.service';
import { StockMarketService } from './stock-market/stock-market.service';
import { CandidatesService } from './candidates/candidates.service';

import { appRoutes } from './app.routes';
import { StockComponent } from './stock/stock.component';
import { ProposalsComponent } from './stocks/proposals/proposals.component';
import { StockMetricChartComponent } from './stock/stock-metric-chart/stock-metric-chart.component';
import { StockMetricsTreeComponent } from './stock/stock-metrics-tree/stock-metrics-tree.component';
import { StockPricesChartComponent } from './stock/stock-prices-chart/stock-prices-chart.component';
import { StockMarketComponent } from './stock-market/stock-market.component';
import { StockOpportunitiesComponent } from './stock-market/stock-opportunities/stock-opportunities.component';
import { CandidatesComponent } from './candidates/candidates.component';

@NgModule({
  declarations: [
    AppComponent,
    TableFilteringExampleComponent,
    StocksComponent,
    CreateStockComponent,
    StockComponent,
    ProposalsComponent,
    StockMetricChartComponent,
    StockMetricsTreeComponent,
    StockPricesChartComponent,
    StockMarketComponent,
    StockOpportunitiesComponent,
    CandidatesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    FlexLayoutModule,

    RouterModule.forRoot(
      appRoutes,
      //{ enableTracing: true }
    ),

    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatOptionModule,
    MatSelectModule,
    MatButtonModule,

    ChartsModule,
  ],
  providers: [
    CandidatesService,
    StockMetricsTreeService,
    StockMarketService,
    StockService,
    StocksService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
