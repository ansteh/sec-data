import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { MatFormFieldModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { MatTableModule } from '@angular/material';

import { AppComponent } from './app.component';
import { TableFilteringExampleComponent } from './table-filtering-example/table-filtering-example.component';
import { StocksComponent } from './stocks/stocks.component';

import { StocksService } from './stocks/stocks.service';

@NgModule({
  declarations: [
    AppComponent,
    TableFilteringExampleComponent,
    StocksComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,

    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
  ],
  providers: [
    StocksService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
