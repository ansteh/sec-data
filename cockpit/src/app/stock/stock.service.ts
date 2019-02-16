import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http: HttpClient) { }

  findByTicker(ticker: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resources/stock/${ticker}`)
  }

  crawlAndDownload(ticker: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resources/stock/${ticker}/crawl`)
  }

  parseFilings(ticker: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resources/stock/${ticker}/parse`)
  }

  getSummary(ticker: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resources/stock/${ticker}/summary`)
  }

  summarize(ticker: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resources/stock/${ticker}/summarize`)
  }

  getHistoricalPrices(ticker: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resources/stock/${ticker}/historical-prices`)
  }

}
