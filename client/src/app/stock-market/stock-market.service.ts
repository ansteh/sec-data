import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

import * as _ from 'lodash';

import { Http } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class StockMarketService {

  constructor(private http: Http) { }

  getOpportunitiesBy(date: Date): Observable<any> {
    return this.http.get(`${environment.apiUrl}/share-market/${date}`)
      .map(res => res.json());
  }
}
