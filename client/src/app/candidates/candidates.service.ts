import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

import { Http } from '@angular/http';
import { environment } from '../../environments/environment';

import * as _ from 'lodash';

@Injectable()
export class CandidatesService {

  constructor(private http: Http) { }

  getAll(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/candidates`)
      .map(res => res.json())
  }

  update(stock: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/candidates`, stock)
      .map(res => res.json())
  }

}
