import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

import { StockDatabase, StocksDataSource } from './stocks.data-source';
import * as _ from 'lodash';

import { Http } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class StocksService {

  private database: StockDatabase;
  public dataSource: StocksDataSource;

  constructor(private http: Http) {
    this.database = new StockDatabase();
    this.dataSource = new StocksDataSource(this.database);
  }

  getStocksFromResources(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resources/stocks`)
      .map(res => res.json())
      .map((stocks) => {
        this.database.setData(_.values(stocks));
        return stocks;
      });
  }

  createStock(stock: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/stock/create`, stock)
      .map(res => res.json());
  }

}
