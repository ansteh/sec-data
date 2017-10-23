import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';


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

import { appRoutes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    TableFilteringExampleComponent,
    StocksComponent,
    CreateStockComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,

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
    StocksService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
