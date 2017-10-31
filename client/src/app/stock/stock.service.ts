import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

import { Http } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class StockService {

  constructor(private http: Http) { }

  findByTicker(ticker: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resources/stock/${ticker}`)
      .map(res => res.json());
  }

  crawlAndDownload(ticker: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resources/stock/${ticker}/crawl`)
      .map(res => res.json());
  }

  parseFilings(ticker: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resources/stock/${ticker}/parse`)
      .map(res => res.json());
  }

}
