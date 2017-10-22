import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

import { Http } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class StocksService {

  constructor(private http: Http) { }

  getStocksFromResources(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resources/stocks`)
      .map(res => res.json());
  }

}
