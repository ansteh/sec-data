import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { DecimalPipe } from '@angular/common';

import { AuthModule } from './auth/auth.module';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material/material.module';

import { AppComponent } from './app.component';

import { CandidatesComponent } from './candidates/candidates.component';
import { CsvImportComponent } from './imports/csv-import/csv-import.component';
import { InterpreterComponent } from './imports/interpreter/interpreter.component';

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
import { FinancialStatementComponent } from './filings/financial-statement/financial-statement.component';
import { TrendExaminationComponent } from './filings/trend-examination/trend-examination.component';
import { TrendExaminationPreviewsComponent } from './filings/trend-examination-previews/trend-examination-previews.component';

import { ScaleEngineComponent } from './filings/scale-engine/scale-engine.component';
import { ScaleClauseComponent } from './filings/scale-engine/scale-clause/scale-clause.component';
import { ScaleDataSourceComponent } from './filings/scale-engine/scale-data-source/scale-data-source.component';
import { ScaleTemplateComponent } from './filings/scale-engine/scale-template/scale-template.component';
import { ScaleRankingComponent } from './filings/scale-ranking/scale-ranking.component';

import { DiaryComponent } from './diary/diary.component';
import { DataTableComponent } from './diary/data-table/data-table.component';
import { PortfolioCalibrationComponent } from './diary/portfolio-calibration/portfolio-calibration.component';
import { PortfolioCompositionComponent } from './diary/portfolio-composition/portfolio-composition.component';

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

    // filings:
    FilingsComponent,
    FinancialStatementComponent,
    TrendExaminationComponent,
    TrendExaminationPreviewsComponent,

    // filings scaling:
    ScaleEngineComponent,
    ScaleClauseComponent,
    ScaleDataSourceComponent,
    ScaleTemplateComponent,
    ScaleRankingComponent,

    CsvImportComponent,
    InterpreterComponent,

    // Diary
    DiaryComponent,
    DataTableComponent,
    PortfolioCalibrationComponent,
    PortfolioCompositionComponent,

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,

    AppRoutingModule,
    AuthModule,
  ],
  providers: [DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
