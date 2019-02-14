import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { StockDatabase, StocksDataSource } from './stocks.data-source';

import { environment } from '../../environments/environment';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class StocksService {

  private database: StockDatabase;
  public dataSource: StocksDataSource;

  constructor(private http: HttpClient) {
    this.database = new StockDatabase();
    this.dataSource = new StocksDataSource(this.database);
  }

  getStocksFromResources(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resources/stocks`)
      .pipe(map((stocks) => {
        this.database.setData(_.values(stocks));
        return stocks;
      }));
  }

  createStock(stock: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/stock/create`, stock);
  }

}
