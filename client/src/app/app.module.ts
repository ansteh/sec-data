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


import { AppComponent } from './app.component';
import { TableFilteringExampleComponent } from './table-filtering-example/table-filtering-example.component';
import { StocksComponent } from './stocks/stocks.component';
import { CreateStockComponent } from './stocks/create-stock/create-stock.component';

import { StocksService } from './stocks/stocks.service';
import { StockService } from './stock/stock.service';

import { appRoutes } from './app.routes';
import { StockComponent } from './stock/stock.component';
import { ProposalsComponent } from './stocks/proposals/proposals.component';

@NgModule({
  declarations: [
    AppComponent,
    TableFilteringExampleComponent,
    StocksComponent,
    CreateStockComponent,
    StockComponent,
    ProposalsComponent
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
  ],
  providers: [
    StockService,
    StocksService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
